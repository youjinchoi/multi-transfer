import React, { useState, useEffect, useMemo } from "react";

import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { BigNumber } from "bignumber.js";
import chunk from "lodash/chunk";
import sum from "lodash/sum";
import queryString from "query-string";

import transfer_success from "../../assets/transfer_success.png";
import Button from "../../components/Button";
import { Dialog, DialogTitle } from "../../components/Dialog";
import TextField from "../../components/TextField";
import { getTokenBlastContract } from "../../utils";
import SingleTransactionInfo from "./SingleTransactionInfo";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
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
  transactionInfoGrid: {
    display: "flex",
    flexDirection: "column",
    width: 190,
  },
  inputAlignCenter: {
    width: "100%",
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
    },
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

function TransactionInfo({
  tokenInfo,
  recipientInfo,
  setRecipientInfo,
  setActiveStep,
  transactionCount,
  setTransactionCount,
  reset,
}) {
  const classes = useStyles();
  const [recipientChunks, setRecipientChunks] = useState([]);
  const [validRecipientInfo, setValidRecipientInfo] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [estimatedGasAmounts, setEstimatedGasAmounts] = useState([]);
  const [isConfirmingTransfer, setIsConfirmingTransfer] = useState(false);
  const [finishedTransactionCount, setFinishedTransactionCount] = useState(0);
  const [startTransfer, setStartTransfer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [calculatingMessage, setCalculatingMessage] = useState(
    "Calculating Transaction Count"
  );
  const [failedAddresses, setFailedAddresses] = useState(null);
  const [estimatedTransactionCount, setEstimatedTransactionCount] =
    useState(null);

  const isGrid = useMediaQuery("(min-width: 620px)");

  const decimalsBN = new BigNumber(tokenInfo.decimals);
  const multiplierBN = new BigNumber(10).pow(decimalsBN);

  const tokenBlastContract = useMemo(
    () =>
      getTokenBlastContract(
        tokenInfo.networkId,
        tokenInfo.library,
        tokenInfo.sender
      ),
    [tokenInfo]
  );

  useEffect(() => {
    const chunks = chunk(recipientInfo, 10);
    const failedAddressSet = new Set();
    const filterOutFailedAddresses = async () => {
      await Promise.all(
        chunks.map(async (chunk) => {
          const addresses = [];
          const amounts = [];
          chunk.forEach(({ address, amount }) => {
            addresses.push(address);
            const amountBN = new BigNumber(amount);
            amounts.push(amountBN.multipliedBy(multiplierBN).toString());
          });
          const failedAddresses =
            await tokenBlastContract.callStatic.multiTransferToken(
              tokenInfo.address,
              addresses,
              amounts
            );

          failedAddresses.forEach((failed) => {
            if (failed !== deadAddress) {
              failedAddressSet.add(failed);
            }
          });
        })
      );
      console.log("failedAddressSet", failedAddressSet);
      if (failedAddressSet.size > 0) {
        setFailedAddresses(Array.from(failedAddressSet));
        const filtered = recipientInfo.filter(
          (recipient) => !failedAddressSet.has(recipient.address)
        );
        console.log("filtered", filtered);
        setValidRecipientInfo(filtered);
        setRecipientInfo(filtered);
      } else {
        setValidRecipientInfo(recipientInfo);
      }
    };

    filterOutFailedAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!estimatedTransactionCount) {
      return;
    }
    const checkGasFee = async (estimatedTransactionCount) => {
      console.log("checkGasFee", estimatedTransactionCount);
      const testChunkSize =
        validRecipientInfo?.length / estimatedTransactionCount;
      console.log("testChunkSize", testChunkSize);
      const testChunk = validRecipientInfo.slice(0, testChunkSize + 1);
      const addresses = [];
      const amounts = [];
      testChunk.forEach(({ address, amount }) => {
        addresses.push(address);
        const amountBN = new BigNumber(amount);
        amounts.push(amountBN.multipliedBy(multiplierBN).toString());
      });

      try {
        const gasPrice = 10;
        const gasResult = await tokenBlastContract.estimateGas
          .multiTransferToken(tokenInfo.address, addresses, amounts)
          .catch((e) => {
            console.error("error occured", e);
            if (e.message.startsWith("gas required exceeds allowance")) {
              console.log("adjust transaction count");
              setEstimatedTransactionCount(estimatedTransactionCount + 1);
            }
          });

        console.log("gasResult", gasResult.toString());
        const value = Math.floor(
          validRecipientInfo?.length / estimatedTransactionCount
        );
        const mod = validRecipientInfo?.length % estimatedTransactionCount;
        const estimatedTransferPerTransaction = mod === 0 ? value : value + 1;
        setTransactionCount(estimatedTransactionCount);
        setRecipientChunks(
          chunk(validRecipientInfo, estimatedTransferPerTransaction)
        );
        setIsLoading(false);

        const encodedData = await tokenBlastContract
          .multiTransferToken(tokenInfo.address, addresses, amounts)
          .encodeABI({
            from: tokenInfo.sender,
          });
        console.log(gasPrice, encodedData);
      } catch (error) {
        console.error(error);
        return;
      }
    };
    checkGasFee(estimatedTransactionCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedTransactionCount]);

  useEffect(() => {
    if (validRecipientInfo?.length) {
      setCalculatingMessage("Calculating Estimated BNB Cost");

      const getGasFee = async () => {
        const gasPriceBN = await tokenBlastContract.provider.getGasPrice();
        console.log("gasPrice", gasPriceBN.toNumber());
        setGasPrice(gasPriceBN.toNumber());
        try {
          const gasResult =
            await tokenBlastContract.estimateGas.multiTransferToken(
              tokenInfo.address,
              [tokenBlastContract.address],
              [multiplierBN.toString()],
              {
                gasPrice: gasPrice,
              }
            );
          console.log("gasResult", gasResult.toString());
          const multiplier = 3;
          const { m } = queryString.parse(window.location.search);
          const estimatedTransferPerTransaction = Math.round(
            25000000 / (gasResult.toNumber() * (m ? Number(m) : multiplier))
          );
          console.log(
            "estimatedTransferPerTransaction",
            estimatedTransferPerTransaction
          );
          const value = Math.floor(
            validRecipientInfo?.length / estimatedTransferPerTransaction
          );
          const mod =
            validRecipientInfo?.length % estimatedTransferPerTransaction;
          const estimatedTransactionCount = mod === 0 ? value : value + 1;
          console.log("estimated transaction count", estimatedTransactionCount);
          // setEstimatedTransactionCount(estimatedTransactionCount);
          console.log("estimated transaction count", estimatedTransactionCount);
          console.log("gasResult", gasResult.toString());
          setTransactionCount(estimatedTransactionCount);
          setRecipientChunks(
            chunk(validRecipientInfo, estimatedTransferPerTransaction)
          );
          setIsLoading(false);
        } catch (e) {
          console.error(e);
        }
      };

      getGasFee();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validRecipientInfo]);

  const estimatedCost = useMemo(() => {
    if (estimatedGasAmounts.length !== recipientChunks.length || !gasPrice) {
      return null;
    }

    const totalGas = sum(estimatedGasAmounts);
    console.log("totalGas", totalGas);
    const estimated = (gasPrice / 1000000000000000000) * totalGas;
    console.log("estimated gas", estimated);
    return estimated;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedGasAmounts, gasPrice]);

  const addEstimatedGasAmount = (amount) => {
    if (!amount) {
      return;
    }
    console.log("addEstimatedGasAmount", estimatedGasAmounts, amount);
    setEstimatedGasAmounts([...estimatedGasAmounts, amount]);
  };

  const increaseFinishedTransactionCount = () =>
    setFinishedTransactionCount(finishedTransactionCount + 1);

  const confirmTransfer = () => setIsConfirmingTransfer(true);

  const closeConfirmTransfer = () => setIsConfirmingTransfer(false);

  const proceedTransfer = () => {
    closeConfirmTransfer();
    setStartTransfer(true);
  };

  const handleDialogClose = () => {
    setFailedAddresses(null);
  };

  return (
    <Box
      className={classes.root}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      {isLoading || !estimatedCost ? (
        <Box display="flex" alignItems="center" flexDirection="column" my={2}>
          <Typography className={classes.label}>
            {calculatingMessage}
          </Typography>
          <CircularProgress className={classes.loading} />
        </Box>
      ) : (
        <Box
          display={isGrid ? "flex" : "block"}
          justifyContent="center"
          width="100%"
        >
          <Box m={1} className={isGrid && classes.transactionInfoGrid}>
            <Typography className={classes.label}>
              Total Transaction Count
            </Typography>
            <TextField
              disabled
              value={transactionCount}
              className={classes.inputAlignCenter}
            />
          </Box>
          <Box m={1} className={isGrid && classes.transactionInfoGrid}>
            <Typography className={classes.label}>Gas Price(Gwei)</Typography>
            <TextField
              disabled
              value={gasPrice / 1000000000}
              className={classes.inputAlignCenter}
            />
          </Box>
          <Box m={1} className={isGrid && classes.transactionInfoGrid}>
            <Typography className={classes.label}>
              Estimated BNB Cost
            </Typography>
            <TextField
              disabled
              value={estimatedCost.toFixed(6)}
              className={classes.inputAlignCenter}
            />
          </Box>
        </Box>
      )}
      {!!failedAddresses?.length && (
        <Dialog
          onClose={handleDialogClose}
          open={!!failedAddresses?.length}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle onClose={handleDialogClose}>
            Expected failed addresses below will be ignored
          </DialogTitle>
          <DialogContent>
            <Table size="small">
              <TableBody>
                {failedAddresses.map((failed, index) => (
                  <TableRow key={failed}>
                    <CustomTableCell className={classes.failedLineNumberCell}>
                      {index + 1}
                    </CustomTableCell>
                    <CustomTableCell className={classes.failedAddressCell}>
                      {failed}
                    </CustomTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Box m={2}>
              <Button
                onClick={handleDialogClose}
                variant="contained"
                color="primary"
              >
                OK
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
      {isConfirmingTransfer && (
        <Dialog
          onClose={closeConfirmTransfer}
          open={isConfirmingTransfer}
          maxWidth="md"
        >
          <DialogTitle onClose={closeConfirmTransfer}>
            {transactionCount} transaction(s) will be executed
          </DialogTitle>
          <DialogContent>
            Please make sure to click confirm button {transactionCount} time(s)
            on your wallet.
          </DialogContent>
          <DialogActions>
            <Box m={2}>
              <Button
                onClick={proceedTransfer}
                variant="contained"
                color="primary"
              >
                OK
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
      <Box m={2} width="100%">
        {!!recipientChunks.length && (
          <Box m={1}>
            {startTransfer && (
              <Typography className={classes.label}>Transactions</Typography>
            )}
            <Table size="small" className={classes.table}>
              <TableBody>
                {recipientChunks.map((chunk, index) => (
                  <SingleTransactionInfo
                    key={index}
                    index={index}
                    tokenInfo={tokenInfo}
                    recipientInfo={chunk}
                    tokenBlastContract={tokenBlastContract}
                    gasPrice={gasPrice}
                    addEstimatedGasAmount={addEstimatedGasAmount}
                    increaseFinishedTransactionCount={
                      increaseFinishedTransactionCount
                    }
                    startTransfer={startTransfer}
                  />
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        {!!recipientChunks?.length &&
          finishedTransactionCount === recipientChunks?.length && (
            <Box
              m={2}
              display="flex"
              alignItems="center"
              flexDirection="column"
            >
              <Typography variant="h6">
                💉💉💉 Congratulations 💉💉💉
              </Typography>
              <Typography variant="h6" align="center">
                You have succesfully finished your transfers
              </Typography>
            </Box>
          )}
        <Box display="flex" justifyContent="center" m={2}>
          <Box m={1}>
            {finishedTransactionCount > 0 &&
            finishedTransactionCount === recipientChunks?.length ? (
              <Box display="flex" alignItems="center" flexDirection="column">
                <Button variant="contained" color="primary" onClick={reset}>
                  New Transaction
                </Button>
                <img
                  src={transfer_success}
                  alt="transfer success"
                  width="100%"
                />
              </Box>
            ) : (
              <>
                <Button onClick={() => setActiveStep(1)} disabled={false}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={confirmTransfer}
                  disabled={startTransfer || !estimatedCost}
                >
                  Transfer
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default TransactionInfo;
