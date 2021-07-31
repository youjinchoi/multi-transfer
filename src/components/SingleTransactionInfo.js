import React, { useState, useEffect} from 'react';
import { Box, CircularProgress, Typography, Link } from '@material-ui/core';
import { Check, Error } from '@material-ui/icons';
import MultiTransferer from "../abis/MultiTransferer.json";
import { getTransactionUrl } from "../urls";
import TableRow from "@material-ui/core/TableRow";
import withStyles from "@material-ui/core/styles/withStyles";
import TableCell from "@material-ui/core/TableCell";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  lineNumberCell: {
    color: "#00636C",
    backgroundColor: "#F0F0F0",
    width: 20,
    textAlign: "center",
  },
  messageCell: {
    "& a": {
      fontSize: 13
    },
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
    }
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

function SingleTransactionInfo({ index, web3, account, networkId, tokenInfo, recipientInfo, gasPrice, addEstimatedGasAmount, increaseFinishedTransactionCount, startTransfer }) {
  const classes = useStyles();
  const [transactionHash, setTransactionHash] = useState(null);
  const [transactionErrorMessage, setTransactionErrorMessage] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [gasAmount, setGasAmount] = useState(null);

  const decimalsBN = new web3.utils.BN(tokenInfo.decimals);
  const multiplierBN = new web3.utils.BN(10).pow(decimalsBN);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => addEstimatedGasAmount(gasAmount), [gasAmount]);

  useEffect(() => {
    if (transactionStatus === "finish") {
      increaseFinishedTransactionCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionStatus])

  useEffect(() => {
    const multiTransfererAddress = MultiTransferer.addresses[networkId];

    const calculateGas = async () => {
      const multiTransferer = new web3.eth.Contract(MultiTransferer.abi, multiTransfererAddress);
      const addresses = [];
      const amounts = [];
      recipientInfo.forEach(({ address, amount }) => {
        addresses.push(address);
        const amountBN = new web3.utils.BN(amount);
        amounts.push(amountBN.mul(multiplierBN).toString());
      });

      try {
        const encodedData = await multiTransferer.methods.multiTransferToken(tokenInfo.address, addresses, amounts).encodeABI({
          from: account
        })
        web3.eth.estimateGas({
          from: account,
          data: encodedData,
          gasPrice: gasPrice,
          to: multiTransfererAddress,
        })
          .then(gasResult => {
            console.log("gasResult", gasResult);
            setGasAmount(gasResult);
          })
          .catch(e => console.error("error occured", e));
        /*
        const gasResult = await web3.eth.estimateGas({
          from: account,
          data: encodedData,
          gasPrice: gasPrice,
          to: multiTransfererAddress,
        })
        console.log('gas', gasResult);
         */
      } catch (error) {
        setTransactionErrorMessage(error?.message ?? "gas estimation error");
        console.error(error);
        return;
      }
    }

    calculateGas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!startTransfer) {
      return;
    }
    const multiTransfererAddress = MultiTransferer.addresses[networkId];
    const multiTransferer = new web3.eth.Contract(MultiTransferer.abi, multiTransfererAddress);
    const addresses = [];
    const amounts = [];
    recipientInfo.forEach(({ address, amount }) => {
      addresses.push(address);
      const amountBN = new web3.utils.BN(amount);
      amounts.push(amountBN.mul(multiplierBN).toString());
    });
    try {
      multiTransferer.methods.multiTransferToken(tokenInfo.address, addresses, amounts)
        .send({
          from: account,
          gasPrice: gasPrice,
        })
        .on('transactionHash', hash => {
          setTransactionHash(hash);
          setTransactionStatus("pending");
        })
        .on('error', (error) => {
          setTransactionErrorMessage(error?.message ?? "failed to multi transfer");
        })
        .then(result => {
          console.log("transaction finisih", result);
          setTransactionStatus("finish");
        });
    } catch (error) {
      setTransactionErrorMessage(error?.message ?? "failed to multi transfer");
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTransfer]);

  if (!startTransfer) {
    return null;
  }

  const getMessage = () => {
    if (!!transactionErrorMessage) {
      return <Typography className={classes.errorMessage}>{transactionErrorMessage}</Typography>;
    } else if (!!transactionHash) {
      return (
        <Link href={getTransactionUrl(transactionHash, networkId)} target="_blank">{transactionHash}</Link>
      );
    } else {
      return <Typography>Pending Approval</Typography>;
    }
  }

  const getIcon = () => {
    if (transactionErrorMessage) {
      return <Error color="error" />;
    } else if (transactionStatus === "finish") {
      return <Check className={classes.checkIcon} />;
    } else {
      return <CircularProgress size={16} />;
    }
  }

  return (
    <CustomTableRow>
      <CustomTableCell className={classes.lineNumberCell}>{index + 1}</CustomTableCell>
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
