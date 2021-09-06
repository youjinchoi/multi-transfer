import React, { useState, useEffect } from "react";

import { Box, CircularProgress, Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { Check, Error } from "@material-ui/icons";
import { BigNumber } from "bignumber.js";

import { getTransactionUrl } from "../../urls";
import { calculateGasMargin } from "../../utils";

const useStyles = makeStyles(() => ({
  lineNumberCell: {
    color: "#00636C",
    backgroundColor: "#F0F0F0",
    width: 20,
    textAlign: "center",
  },
  messageCell: {
    "& a": {
      fontSize: 12,
    },
    overflowWrap: "anywhere",
  },
  iconCell: {
    width: 20,
  },
  checkIcon: {
    color: "#35B968",
  },
  loadingIcon: {
    width: 16,
    height: 16,
  },
  errorMessage: {
    color: "#f44336",
  },
}));

const CustomTableRow = withStyles(() => ({
  root: {
    "&:first-child td:first-child": {
      borderTopLeftRadius: 15,
    },
    "&:last-child td:first-child": {
      borderBottomLeftRadius: 15,
    },
  },
}))(TableRow);

const CustomTableCell = withStyles(() => ({
  root: {
    border: "none",
    fontSize: 16,
    color: "#00636C",
    padding: "12px 16px",
  },
}))(TableCell);

function SingleTransactionInfo({
  index,
  tokenInfo,
  recipientInfo,
  tokenBlastContract,
  gasPrice,
  addEstimatedGasAmount,
  increaseFinishedTransactionCount,
  startTransfer,
  gasMarginRate,
}) {
  const classes = useStyles();
  const [transactionHash, setTransactionHash] = useState(null);
  const [transactionErrorMessage, setTransactionErrorMessage] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [gasAmount, setGasAmount] = useState(null);

  const decimalsBN = new BigNumber(tokenInfo.decimals);
  const multiplierBN = new BigNumber(10).pow(decimalsBN);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => addEstimatedGasAmount(gasAmount), [gasAmount]);

  useEffect(() => {
    if (transactionStatus === "finish") {
      increaseFinishedTransactionCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionStatus]);

  useEffect(() => {
    const calculateGas = async () => {
      const addresses = [];
      const amounts = [];
      recipientInfo.forEach(({ address, amount }) => {
        addresses.push(address);
        const amountBN = new BigNumber(amount);
        amounts.push(amountBN.multipliedBy(multiplierBN).toFixed());
      });

      try {
        tokenBlastContract.estimateGas
          .multiTransferToken(tokenInfo.address, addresses, amounts, {
            gasPrice: gasPrice,
          })
          .then((gasResult) => {
            console.log(`gasResult ${index}`, gasResult.toString());
            const gasAmountWithMarginStr = calculateGasMargin(
              gasResult.toString(),
              gasMarginRate
            );
            console.log(`gasAmountWithMargin ${index}`, gasAmountWithMarginStr);
            setGasAmount(new BigNumber(gasAmountWithMarginStr));
          })
          .catch((e) => console.error("error occured", e));
      } catch (error) {
        setTransactionErrorMessage(error?.message ?? "gas estimation error");
        console.error(error);
        return;
      }
    };

    calculateGas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!startTransfer) {
      return;
    }
    const addresses = [];
    const amounts = [];
    recipientInfo.forEach(({ address, amount }) => {
      addresses.push(address);
      const amountBN = new BigNumber(amount);
      amounts.push(amountBN.multipliedBy(multiplierBN).toFixed());
    });

    const transfer = async () => {
      try {
        const tx = await tokenBlastContract
          .multiTransferToken(tokenInfo.address, addresses, amounts, {
            gasPrice: gasPrice,
            gasLimit: gasAmount.toFixed(0),
          })
          .catch((e) => {
            console.error(e);
            setTransactionErrorMessage(
              e?.message ?? "failed to multi transfer"
            );
          });

        if (!tx) {
          return;
        }

        setTransactionHash(tx.hash);
        setTransactionStatus("pending");

        const receipt = await tx.wait();
        console.log(`receipt ${index}`, receipt);
        if (receipt?.status) {
          console.log(`gas used ${index}`, receipt.gasUsed.toString());
          setTransactionStatus("finish");
        } else {
          console.error(receipt);
          setTransactionErrorMessage("failed to multi transfer");
        }
      } catch (error) {
        setTransactionErrorMessage(
          error?.message ?? "failed to multi transfer"
        );
        console.error(error);
      }
    };
    transfer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTransfer]);

  if (!startTransfer) {
    return null;
  }

  const getMessage = () => {
    if (transactionErrorMessage) {
      return (
        <Typography className={classes.errorMessage}>
          {transactionErrorMessage}
        </Typography>
      );
    } else if (transactionHash) {
      return (
        <Link
          href={getTransactionUrl(transactionHash, tokenInfo.networkId)}
          target="_blank"
        >
          {transactionHash}
        </Link>
      );
    } else {
      return <Typography>Pending Approval</Typography>;
    }
  };

  const getIcon = () => {
    if (transactionErrorMessage) {
      return <Error color="error" />;
    } else if (transactionStatus === "finish") {
      return <Check className={classes.checkIcon} />;
    } else {
      return <CircularProgress size={16} />;
    }
  };

  return (
    <CustomTableRow>
      <CustomTableCell className={classes.lineNumberCell}>
        {index + 1}
      </CustomTableCell>
      <CustomTableCell className={classes.messageCell}>
        {getMessage()}
      </CustomTableCell>
      <CustomTableCell className={classes.iconCell}>
        <Box display="flex" alignItems="center">
          {getIcon()}
        </Box>
      </CustomTableCell>
    </CustomTableRow>
  );
}

export default SingleTransactionInfo;
