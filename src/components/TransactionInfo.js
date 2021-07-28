import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Box, Typography} from '@material-ui/core';
import chunk from "lodash/chunk";
import sum from "lodash/sum";
import MultiTransferer from "../abis/MultiTransferer.json";
import SingleTransactionInfo from "./SingleTransactionInfo";
import CustomTextField from "./CustomTextField";
import CustomButton from "./CustomButton";

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
  inputAlignCenter: {
    width: 150,
    "& div": {
      backgroundColor: "#FFE267",
      border: "0.6px solid #E5E7EB",
    },
    "& input": {
      textAlign: "center",
      fontWeight: "bold",
    },
  },
}));

function TransactionInfo({ web3, account, tokenInfo, recipientInfo, setActiveStep: setGlobalActiveStep, transactionCount, setTransactionCount, totalAmountWithDecimalsBN, transferPerTransaction }) {
  const classes = useStyles();
  const [recipientChunks, setRecipientChunks] = useState([]);
  const [gasPrice, setGasPrice] = useState(null);
  const [estimatedGasAmounts, setEstimatedGasAmounts] = useState([]);
  const [finishedTransactionCount, setFinishedTransactionCount] = useState(0);
  const [startTransfer, setStartTransfer] = useState(false);

  const decimalsBN = new web3.utils.BN(tokenInfo.decimals);
  const multiplierBN = new web3.utils.BN(10).pow(decimalsBN);

  useEffect(() => {
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
      const value = Math.floor(recipientInfo?.length / estimatedTransferPerTransaction);
      const mod = recipientInfo?.length % estimatedTransferPerTransaction;
      const estimatedTransactionCount = mod === 0 ? value : value + 1;
      console.log("estimated transaction count", estimatedTransactionCount);
      console.log("gasResult", gasResult);
      setTransactionCount(estimatedTransactionCount);
      setRecipientChunks(chunk(recipientInfo, estimatedTransferPerTransaction));
    }

    getGasFee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estimatedCost = useMemo(() => {
    console.log("estimatedGasAmounts", estimatedGasAmounts);
    if (estimatedGasAmounts.length !== recipientChunks.length || !gasPrice) {
      return null;
    }

    const totalGas = sum(estimatedGasAmounts);
    return gasPrice / 1000000000000000000 * totalGas;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedGasAmounts, gasPrice]);

  console.log("estimatedCost", estimatedCost);

  const addEstimatedGasAmount = amount => {
    if (!amount) {
      return;
    }
    console.log("addEstimatedGasAmount", estimatedGasAmounts, amount);
    setEstimatedGasAmounts([...estimatedGasAmounts, amount]);
  }

  const increaseFinishedTransactionCount = () => setFinishedTransactionCount(finishedTransactionCount + 1);

  const proceedTransfer = () => setStartTransfer(true);

  console.log("finishedTransactionCount", finishedTransactionCount);

  return (
    <Box className={classes.root} display="flex" flexDirection="column" alignItems="center">
      <Box display="flex" justifyContent="center">
        <Box m={1}>
          <Typography className={classes.label}>Total Transaction Count</Typography>
          <CustomTextField
            disabled
            value={transactionCount ? transactionCount : "calculating..."}
            className={classes.inputAlignCenter}
          />
        </Box>
        <Box m={1}>
          <Typography className={classes.label}>Gas Price(Gwei)</Typography>
          <CustomTextField
            disabled
            value={gasPrice ? (gasPrice / 1000000000) : "loading..."}
            className={classes.inputAlignCenter}
          />
        </Box>
        <Box m={1}>
          <Typography className={classes.label}>Estimated BNB Cost</Typography>
          <CustomTextField
            disabled
            value={estimatedCost ? estimatedCost.toFixed(6) : "calculating..."}
            className={classes.inputAlignCenter}
          />
        </Box>
      </Box>
      <Box style={{ width: "600px" }} m={2}>
        {!!recipientChunks.length && recipientChunks.map((chunk, index) => (
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
          )
        )}
        {finishedTransactionCount === recipientChunks?.length && (
          <Box m={2}>
            All transactions successfully finished!
          </Box>
        )}
        <Box display="flex" justifyContent="center" m={2}>
          <Box m={1}>
            {finishedTransactionCount > 0 && finishedTransactionCount === recipientChunks?.length ? (
              <CustomButton variant="contained" color="primary" onClick={() => window.location.reload()}>
                Reset
              </CustomButton>
            ) : (
              <>
                <CustomButton
                  onClick={() => setGlobalActiveStep(1)}
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
