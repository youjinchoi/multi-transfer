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
import queryString from "query-string";

import transfer_success from "../../assets/transfer_success.png";
import Button from "../../components/Button";
import { Dialog, DialogTitle } from "../../components/Dialog";
import TextField from "../../components/TextField";
import { defaultGasMarginRate } from "../../configs";
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
    marginTop: 8,
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
    "Step 1. Validating Recipient Addresses"
  );
  const [failedAddresses, setFailedAddresses] = useState(null);

  const isGrid = useMediaQuery("(min-width: 620px)");

  const decimalsBN = new BigNumber(tokenInfo.decimals);
  const multiplierBN = new BigNumber(10).pow(decimalsBN);

  const { g } = queryString.parse(window.location.search);
  const gasMarginRate = g ? Number(g) : defaultGasMarginRate;

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
            amounts.push(amountBN.multipliedBy(multiplierBN).toFixed());
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

      if (failedAddressSet.size > 0) {
        const failedAddresses = Array.from(failedAddressSet);
        console.log("failedAddress", failedAddresses);
        setFailedAddresses(failedAddresses);
        const filtered = recipientInfo.filter(
          (recipient) => !failedAddressSet.has(recipient.address)
        );
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
    if (validRecipientInfo?.length) {
      setCalculatingMessage("Step 2. Calculating Transaction Count");
      setIsLoading(true);

      const calculateTransactionCount = async () => {
        const gasPriceBN = await tokenBlastContract.provider.getGasPrice();
        const block = await tokenBlastContract.provider.getBlock("latest");
        const gasLimitWithMarginRateBN = new BigNumber(
          block.gasLimit.toString()
        ).div(new BigNumber(gasMarginRate));
        console.log("gasLimit", block.gasLimit.toString());
        console.log("gasLimitWithMargin", gasLimitWithMarginRateBN.toString());
        console.log("gasPrice", gasPriceBN.toNumber());
        setGasPrice(gasPriceBN.toNumber());
        let maxSuccessCount = 0;
        let minFailedCount = validRecipientInfo?.length;
        let count = validRecipientInfo?.length;
        while (count !== maxSuccessCount) {
          console.log(
            "count, maxSuccessCount, minFailedCount",
            count,
            maxSuccessCount,
            minFailedCount
          );
          const tempRecipients = validRecipientInfo.slice(0, count - 1);
          const addresses = [];
          const amounts = [];
          tempRecipients.forEach(({ address, amount }) => {
            addresses.push(address);
            const amountBN = new BigNumber(amount);
            amounts.push(amountBN.multipliedBy(multiplierBN).toFixed());
          });

          try {
            const gasResult =
              await tokenBlastContract.estimateGas.multiTransferToken(
                tokenInfo.address,
                addresses,
                amounts,
                {
                  gasPrice: gasPrice,
                }
              );
            console.log("addresses and gasResult", count, gasResult.toString());
            if (
              new BigNumber(gasResult.toString()).gt(gasLimitWithMarginRateBN)
            ) {
              minFailedCount = Math.min(minFailedCount, count);
            } else {
              maxSuccessCount = Math.max(count, maxSuccessCount);
            }
          } catch (error) {
            console.error("error while calculating transaction count", error);
            minFailedCount = Math.min(minFailedCount, count);
          }
          count = Math.floor((maxSuccessCount + minFailedCount) / 2);
        }
        const recipientCountPerTransaction =
          count === validRecipientInfo?.length
            ? count
            : Math.floor(count / 10) * 10;

        const chunks = chunk(validRecipientInfo, recipientCountPerTransaction);
        setRecipientChunks(chunks);
        setTransactionCount(chunks.length);
        setCalculatingMessage("Step 3. Calculating Estimated BNB Cost");
      };

      calculateTransactionCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validRecipientInfo]);

  const estimatedCost = useMemo(() => {
    if (
      !estimatedGasAmounts?.length ||
      estimatedGasAmounts.length !== recipientChunks.length ||
      !gasPrice
    ) {
      return null;
    }
    const totalGasBN = BigNumber.sum(...estimatedGasAmounts);
    const estimatedPerGas = new BigNumber(gasPrice / 1000000000000000000);
    const estimatedBN = estimatedPerGas.multipliedBy(totalGasBN);
    console.log("total estimated BNB", estimatedBN.toString());
    return estimatedBN;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedGasAmounts, gasPrice]);

  useEffect(() => {
    if (estimatedCost) {
      setIsLoading(false);
    }
  }, [estimatedCost]);

  const addEstimatedGasAmount = (amountBN) => {
    if (!amountBN) {
      return;
    }
    setEstimatedGasAmounts([...estimatedGasAmounts, amountBN]);
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
        <>
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
                value={estimatedCost?.toFixed(6)}
                className={classes.inputAlignCenter}
              />
            </Box>
          </Box>
          <Box m={1}>
            <Typography>
              *actual BNB cost will be lower than estimation
            </Typography>
          </Box>
        </>
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
                    gasMarginRate={g ? Number(g) : defaultGasMarginRate}
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
