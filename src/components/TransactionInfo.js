import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, CircularProgress, Table, TableBody, Typography } from '@material-ui/core';
import chunk from "lodash/chunk";
import sum from "lodash/sum";
import MultiTransferer from "../abis/MultiTransferer.json";
import SingleTransactionInfo from "./SingleTransactionInfo";
import CustomTextField from "./CustomTextField";
import CustomButton from "./CustomButton";
import transfer_success from "../assets/transfer_success.png";
import { CustomDialog, CustomDialogTitle } from "./CustomDialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TableRow from "@material-ui/core/TableRow";
import withStyles from "@material-ui/core/styles/withStyles";
import TableCell from "@material-ui/core/TableCell";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  label: {
    marginTop: 8,
    marginBottom: 8,
  },
  loading: {
    color: "#FFFFFF",
  },
  inputAlignCenter: {
    width: 180,
    "& div": {
      backgroundColor: "#FFE267",
      border: "0.6px solid #E5E7EB",
    },
    "& input": {
      textAlign: "center",
      fontWeight: "bold",
    },
  },
  table: {
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
  },
  tableRow: {
    "&:first-child td:first-child": {
      borderTopLeftRadius: 15,
    },
    "&:last-child td:first-child": {
      borderBottomLeftRadius: 15,
    }
  },
  lineNumberCell: {
    color: "#00636C",
    backgroundColor: "#F0F0F0",
  },
  failedAddress: {
    color: "#B10069",
  },
  failedLineNumberCell: {
    color: "#00636C",
    fontSize: 18,
  },
  failedAddressCell: {
    color: "#B10069",
    textAlign: "center",
    fontSize: 18,
  },
}));

const CustomTableCell = withStyles(() => ({
  root: {
    border: "none",
  },
}))(TableCell);

const deadAddress = "0x0000000000000000000000000000000000000000";

function TransactionInfo({ web3, account, tokenInfo, recipientInfo, setRecipientInfo, setActiveStep, transactionCount, setTransactionCount, reset }) {
  const classes = useStyles();
  const [recipientChunks, setRecipientChunks] = useState([]);
  const [validRecipientInfo, setValidRecipientInfo] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [estimatedGasAmounts, setEstimatedGasAmounts] = useState([]);
  const [finishedTransactionCount, setFinishedTransactionCount] = useState(0);
  const [startTransfer, setStartTransfer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [calculatingMessage, setCalculatingMessage] = useState("Calculating Transaction Count");
  const [failedAddresses, setFailedAddresses] = useState(null);

  const decimalsBN = new web3.utils.BN(tokenInfo.decimals);
  const multiplierBN = new web3.utils.BN(10).pow(decimalsBN);

  useEffect(() => {
    const multiTransfererAddress = MultiTransferer.addresses[window.__networkId__];
    const multiTransferer = new web3.eth.Contract(MultiTransferer.abi, multiTransfererAddress);

    const chunks = chunk(recipientInfo, 10);
    const failedAddressSet = new Set();
    const filterOutFailedAddresses = async () => {
      await Promise.all(chunks.map(async (chunk, index) => {
        const addresses = [];
        const amounts = [];
        chunk.forEach(({ address, amount }) => {
          addresses.push(address);
          const amountBN = new web3.utils.BN(amount);
          amounts.push(amountBN.mul(multiplierBN).toString());
        });
        const failedAddresses = await multiTransferer.methods.multiTransferToken(tokenInfo.address, addresses, amounts).call({
          from: account,
        });
        failedAddresses.forEach((failed, subIndex) => {
          if (failed !== deadAddress) {
            console.log("failed", failed);
            failedAddressSet.add(failed);
          } else {
            failedAddressSet.add("0x7b18D2Be18f31ab13c3D89d86680742eaBD95519");
          }
        });
      }));
      console.log("final failedAddressSet", failedAddressSet);
      if (failedAddressSet.size > 0) {
        setFailedAddresses(Array.from(failedAddressSet));
        const filtered = recipientInfo.filter(recipient => !failedAddressSet.has(recipient.address));
        console.log("filtered", filtered);
        setValidRecipientInfo(filtered);
        setRecipientInfo(filtered);
      } else {
        setValidRecipientInfo(recipientInfo);
      }
    }

    filterOutFailedAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (validRecipientInfo?.length) {
      setCalculatingMessage("Calculating Estimated BNB Cost");

      const multiTransfererAddress = MultiTransferer.addresses[window.__networkId__];
      const multiTransferer = new web3.eth.Contract(MultiTransferer.abi, multiTransfererAddress);

      const getGasFee = async () => {
        const encodedData = await multiTransferer.methods.multiTransferToken(tokenInfo.address, [multiTransfererAddress], [multiplierBN.toString()]).encodeABI({
          from: account
        })
        const gasPriceResult = await web3.eth.getGasPrice();
        console.log("gasPrice", gasPriceResult);
        setGasPrice(gasPriceResult);
        const gasResult = await web3.eth.estimateGas({
          from: account,
          data: encodedData,
          gasPrice: gasPrice,
          to: multiTransfererAddress,
        })

        const estimatedTransferPerTransaction = Math.round(25000000 / gasResult);
        const value = Math.floor(validRecipientInfo?.length / estimatedTransferPerTransaction);
        const mod = validRecipientInfo?.length % estimatedTransferPerTransaction;
        const estimatedTransactionCount = mod === 0 ? value : value + 1;
        console.log("estimated transaction count", estimatedTransactionCount);
        console.log("gasResult", gasResult);
        setTransactionCount(estimatedTransactionCount);
        setRecipientChunks(chunk(validRecipientInfo, estimatedTransferPerTransaction));
        setIsLoading(false);
      }

      getGasFee();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validRecipientInfo])

  const estimatedCost = useMemo(() => {
    if (estimatedGasAmounts.length !== recipientChunks.length || !gasPrice) {
      return null;
    }

    const totalGas = sum(estimatedGasAmounts);
    const estimated = gasPrice / 1000000000000000000 * totalGas;
    console.log("estimated gas", estimated);
    return estimated;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedGasAmounts, gasPrice]);

  const addEstimatedGasAmount = amount => {
    if (!amount) {
      return;
    }
    console.log("addEstimatedGasAmount", estimatedGasAmounts, amount);
    setEstimatedGasAmounts([...estimatedGasAmounts, amount]);
  }

  const increaseFinishedTransactionCount = () => setFinishedTransactionCount(finishedTransactionCount + 1);

  const proceedTransfer = () => setStartTransfer(true);

  const handleDialogClose = () => {
    setFailedAddresses(null);
  };

  return (
    <Box className={classes.root} display="flex" flexDirection="column" alignItems="center">
      {isLoading || !estimatedCost? (
        <Box display="flex" alignItems="center" flexDirection="column" my={2}>
          <Typography className={classes.label}>{calculatingMessage}</Typography>
          <CircularProgress className={classes.loading} />
        </Box>
      ) : (
        <Box display="flex" justifyContent="center">
          <Box m={1}>
            <Typography className={classes.label}>Total Transaction Count</Typography>
            <CustomTextField
              disabled
              value={transactionCount}
              className={classes.inputAlignCenter}
            />
          </Box>
          <Box m={1}>
            <Typography className={classes.label}>Gas Price(Gwei)</Typography>
            <CustomTextField
              disabled
              value={(gasPrice / 1000000000)}
              className={classes.inputAlignCenter}
            />
          </Box>
          <Box m={1}>
            <Typography className={classes.label}>Estimated BNB Cost</Typography>
            <CustomTextField
              disabled
              value={estimatedCost.toFixed(6)}
              className={classes.inputAlignCenter}
            />
          </Box>
        </Box>
      )}
      {!!failedAddresses?.length && (
        <CustomDialog onClose={handleDialogClose} open={!!failedAddresses?.length} fullWidth={true} maxWidth="md">
          <CustomDialogTitle onClose={handleDialogClose}>
            Expected failed addresses below will be ignored
          </CustomDialogTitle>
          <DialogContent>
            <Table size="small">
              <TableBody>
                {failedAddresses.map((failed, index) => (
                  <TableRow key={failed}>
                    <CustomTableCell className={classes.failedLineNumberCell}>{index + 1}</CustomTableCell>
                    <CustomTableCell className={classes.failedAddressCell}>{failed}</CustomTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Box m={2}>
              <CustomButton autoFocus onClick={handleDialogClose} variant="contained" color="primary">
                OK
              </CustomButton>
            </Box>
          </DialogActions>
        </CustomDialog>
      )}
      <Box style={{ width: "600px" }} m={2}>
        {!!recipientChunks.length && (
          <>
            {startTransfer && <Typography className={classes.label}>Transactions</Typography>}
            <Table size="small" className={classes.table}>
              <TableBody>
                {recipientChunks.map((chunk, index) => (
                  <SingleTransactionInfo
                    key={index}
                    index={index}
                    web3={web3}
                    account={account}
                    tokenInfo={tokenInfo}
                    recipientInfo={chunk}
                    gasPrice={gasPrice}
                    addEstimatedGasAmount={addEstimatedGasAmount}
                    increaseFinishedTransactionCount={increaseFinishedTransactionCount}
                    startTransfer={startTransfer}
                  />
                ))}
              </TableBody>
            </Table>
          </>
        )}
        {recipientChunks?.length && finishedTransactionCount === recipientChunks?.length && (
          <Box m={2} display="flex" alignItems="center" flexDirection="column">
            <Typography variant="h6">💉💉💉 Congratulations 💉💉💉</Typography>
            <Typography variant="h6">You have succesfully finished your transfers</Typography>
          </Box>
        )}
        <Box display="flex" justifyContent="center" m={2}>
          <Box m={1}>
            {finishedTransactionCount > 0 && finishedTransactionCount === recipientChunks?.length ? (
              <Box display="flex" alignItems="center" flexDirection="column">
                <CustomButton variant="contained" color="primary" onClick={reset}>
                  New Transaction
                </CustomButton>
                <img src={transfer_success} alt="transfer success" />
              </Box>
            ) : (
              <>
                <CustomButton
                  onClick={() => setActiveStep(1)}
                  disabled={false}
                >
                  Back
                </CustomButton>
                <CustomButton variant="contained" color="primary" onClick={proceedTransfer} disabled={startTransfer || !estimatedCost}>
                  Transfer
                </CustomButton>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default TransactionInfo;
