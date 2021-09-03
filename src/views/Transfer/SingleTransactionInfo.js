import React, { useState, useEffect, useMemo } from "react";

import { Box, CircularProgress, Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { Check, Error } from "@material-ui/icons";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "ethers";

import { getTransactionUrl } from "../../urls";
import { getTokenBlastContract } from "../../utils";

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
  gasPrice,
  addEstimatedGasAmount,
  increaseFinishedTransactionCount,
  startTransfer,
}) {
  const classes = useStyles();
  const [transactionHash, setTransactionHash] = useState(null);
  const [transactionErrorMessage, setTransactionErrorMessage] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [gasAmount, setGasAmount] = useState(null);

  const { account, library, chainId } = useWeb3React();

  const decimalsBN = BigNumber.from(tokenInfo.decimals);
  const multiplierBN = BigNumber.from(10).pow(decimalsBN);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => addEstimatedGasAmount(gasAmount), [gasAmount]);

  useEffect(() => {
    if (transactionStatus === "finish") {
      increaseFinishedTransactionCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionStatus]);

  const tokenBlastContract = useMemo(
    () => getTokenBlastContract(chainId, library, account),
    [chainId, library, account]
  );

  useEffect(() => {
    const calculateGas = async () => {
      const addresses = [];
      const amounts = [];
      recipientInfo.forEach(({ address, amount }) => {
        addresses.push(address);
        const amountBN = BigNumber.from(amount);
        amounts.push(amountBN.mul(multiplierBN).toString());
      });

      try {
        tokenBlastContract.estimateGas
          .multiTransferToken(tokenInfo.address, addresses, amounts, {
            gasPrice: gasPrice,
          })
          .then((gasResult) => {
            console.log("gasResult", gasResult.toNumber());
            setGasAmount(gasResult.toNumber());
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
      const amountBN = BigNumber.from(amount);
      amounts.push(amountBN.mul(multiplierBN).toString());
    });

    const transfer = async () => {
      try {
        const tx = await tokenBlastContract
          .multiTransferToken(tokenInfo.address, addresses, amounts, {
            gasPrice: gasPrice,
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
        if (receipt?.status) {
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
          href={getTransactionUrl(transactionHash, chainId)}
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
