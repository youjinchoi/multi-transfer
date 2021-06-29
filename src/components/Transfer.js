import React, {useMemo, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TransferInput from './TransferInput';
import TransferApprove from './TransferApprove';
import TransferConfirm from './TransferConfirm';
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Box, Button, Divider, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import Web3Utils from "web3-utils";
import {getContractABI} from "../apis/bscscan";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

function getSteps() {
  return ['Input transfer details', 'Review', 'Transfer'];
}

function Transfer({ web3, account }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validInputs, setValidInputs] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [transactionCount, setTransactionCount] = useState(1);
  const steps = getSteps();

  const handleReset = () => {
    setActiveStep(0);
  };

  const onTokenAddressChange = async (e) => {
    const value = e?.target?.value;
    if (!value || !value.trim()) {
      setTokenInfo(null);
      return;
    }
    if (!Web3Utils.isAddress(value)) {
      setTokenInfo({ isValid: false, errorMessage: "Invalid token address. please check again" });
      return;
    }
    setIsLoading(true);
    const abi = await getContractABI(value);
    if (!abi) {
      setTokenInfo({ isValid: false, errorMessage: "Invalid token address. please check again" });
      setIsLoading(false);
      return;
    }
    const contract = new web3.eth.Contract(abi, value);
    const decimals = await contract.methods.decimals().call();
    const name = await contract.methods.name().call();
    const symbol = await contract.methods.symbol().call();
    const balance = account ? await contract.methods.balanceOf(account).call() : null;
    let adjustedBalance = null;
    if (balance) {
      const decimalsBN = new web3.utils.BN(decimals);
      const balanceBN = new web3.utils.BN(balance);
      const divisor = new web3.utils.BN(10).pow(decimalsBN);
      const beforeDecimal = balanceBN.div(divisor);
      const afterDecimal  = balanceBN.mod(divisor);
      adjustedBalance = `${beforeDecimal.toString()}.${afterDecimal.toString()}`;
    }
    setTokenInfo({ contract, address: value, name, symbol, decimals, balance: adjustedBalance, isValid: true });
    setIsLoading(false);
  };

  const totalAmount = useMemo(() => recipientInfo?.reduce(
    (acc, val) => (acc + Number(val.amount)), 0
    )
    , [recipientInfo]);

  const handleTransactionCountChange = (e) => {
    const value = e?.target?.value;
    if (Number(value) < 1 || Number(value) > recipientInfo?.length) {
      return;
    }
    setTransactionCount(value);
  }

  const transferPerTransaction = useMemo(() => {
    const value = Math.floor(recipientInfo?.length / transactionCount);
    const mod = recipientInfo?.length % transactionCount;
    return mod === 0 ? value : value + 1;
  }, [recipientInfo, transactionCount]);

  return (
    <div className={classes.root}>
      <Box display="flex" justifyContent="center" m={1}>
        <Stepper activeStep={activeStep} alternativeLabel style={{ width: "612px" }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>All steps completed</Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <Box>
            <Box display="flex" justifyContent="center" m={1}>
              <TextField
                required
                error={tokenInfo?.isValid === false}
                helperText={tokenInfo?.errorMessage}
                label="Token Address"
                variant="outlined"
                onChange={onTokenAddressChange}
                disabled={activeStep !== 0}
                style={{ width: "612px" }}
              />
            </Box>
            {isLoading && (
              <Box m={1} mt={2}>
                <CircularProgress />
              </Box>
            )}
            {!!tokenInfo && tokenInfo.isValid && (
              <>
                <Box display="flex" justifyContent="center">
                  <Box m={1}>
                    <TextField label="Name" variant="outlined" value={tokenInfo.name} disabled m={1} />
                  </Box>
                  <Box m={1}>
                    <TextField label="Symbol" variant="outlined" value={tokenInfo.symbol} disabled m={1} />
                  </Box>
                  <Box m={1}>
                    <TextField label="Decimals" variant="outlined" value={tokenInfo.decimals} disabled m={1} />
                  </Box>
                </Box>
                <Box display="flex" justifyContent="center" m={1}>
                  <TextField
                    label="Token Balance of Connected Wallet"
                    variant="outlined"
                    value={tokenInfo.balance}
                    disabled
                    style={{ width: "612px" }}
                  />
                </Box>
              </>
            )}
            <Box display="flex" justifyContent="center" m={1}>
              <Box my={2} style={{ width: "612px" }}>
                <Divider />
              </Box>
            </Box>
            {activeStep === 0 && (
              <TransferInput
                web3={web3}
                tokenInfo={tokenInfo}
                setTokenInfo={setTokenInfo}
                validInputs={validInputs}
                setValidInputs={setValidInputs}
                setRecipientInfo={setRecipientInfo}
                setActiveStep={setActiveStep}

              />
            )}
            {activeStep === 1 && (
              <TransferApprove
                web3={web3}
                recipientInfo={recipientInfo}
                setActiveStep={setActiveStep}
                transactionCount={transactionCount}
                totalAmount={totalAmount}
                handleTransactionCountChange={handleTransactionCountChange}
                transferPerTransaction={transferPerTransaction}
              />
            )}
            {activeStep === 2 && (
              <TransferConfirm
                web3={web3}
                account={account}
                tokenInfo={tokenInfo}
                recipientInfo={recipientInfo}
                setActiveStep={setActiveStep}
                transactionCount={transactionCount}
                totalAmount={totalAmount}
                handleTransactionCountChange={handleTransactionCountChange}
                transferPerTransaction={transferPerTransaction}
              />
            )}
          </Box>
        )}
      </div>
    </div>
  );
}

export default Transfer;
