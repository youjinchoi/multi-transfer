import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CsvInfo from './CsvInfo';
import TransactionInfo from './TransactionInfo';
import { Box, Button, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import TokenInfo from "./TokenInfo";
import TransferInfo from "./TransferInfo";
import RecipientInfo from "./RecipientInfo";

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
  stepper: {
    backgroundColor: "transparent",
  },
  stepLabel: {
    color: "#FFFFFF",
  },
  welcomeMessage: {
    color: "#FFFFFF",
  },
  button: {
    background: "#EC008C",
  }
}));

const steps = ['Input transfer details', 'Review', 'Transfer'];

function Transfer({ web3, account }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [validInputs, setValidInputs] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [transactionCount, setTransactionCount] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [totalAmountWithDecimalsBN, setTotalAmountWithDecimalsBN] = useState(null);

  useEffect(() => {
    if (!web3) {
      return;
    }

    if (!recipientInfo?.length) {
      setTotalAmount(null);
      setTotalAmountWithDecimalsBN(null);
    }
    const totalAmount = recipientInfo?.reduce(
      (acc, val) => (acc + Number(val.amount)), 0
    );
    setTotalAmount(totalAmount);

    if (!tokenInfo?.decimals) {
      return;
    }

    const decimalsBN = new web3.utils.BN(tokenInfo.decimals);
    const multiplierBN = new web3.utils.BN(10).pow(decimalsBN);
    const totalAmountBN = new web3.utils.BN(totalAmount);
    const totalAmountWithDecimalsBN = totalAmountBN.mul(multiplierBN);
    setTotalAmountWithDecimalsBN(totalAmountWithDecimalsBN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientInfo, tokenInfo?.decimals]);

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" m={1}>
      <Stepper activeStep={activeStep} alternativeLabel style={{ width: "612px" }} className={classes.stepper}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel><span className={classes.stepLabel}>{label}</span></StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box m={2}>
        <Typography variant="h4" className={classes.welcomeMessage}>Welcome to <strong>Token Blast</strong></Typography>
      </Box>
      <div>
        <Box>
          <TokenInfo
            web3={web3}
            account={account}
            activeStep={activeStep}
            tokenInfo={tokenInfo}
            setTokenInfo={setTokenInfo}
            totalAmountWithDecimalsBN={totalAmountWithDecimalsBN}
          />
          {activeStep > 0 && (
            <TransferInfo
              recipientInfo={recipientInfo}
              totalAmount={totalAmount}
            />
          )}
          {activeStep === 0 && (
            <CsvInfo
              web3={web3}
              tokenInfo={tokenInfo}
              setTokenInfo={setTokenInfo}
              validInputs={validInputs}
              setValidInputs={setValidInputs}
              setRecipientInfo={setRecipientInfo}
              setActiveStep={setActiveStep}
              transaction
            />
          )}
          {activeStep === 1 && (
            <RecipientInfo
              web3={web3}
              account={account}
              recipientInfo={recipientInfo}
              setActiveStep={setActiveStep}
              transactionCount={transactionCount}
              totalAmount={totalAmount}
              totalAmountWithDecimalsBN={totalAmountWithDecimalsBN}
              tokenInfo={tokenInfo}
            />
          )}
          {activeStep > 1 && (
            <TransactionInfo
              web3={web3}
              account={account}
              tokenInfo={tokenInfo}
              recipientInfo={recipientInfo}
              setActiveStep={setActiveStep}
              transactionCount={transactionCount}
              setTransactionCount={setTransactionCount}
              totalAmount={totalAmount}
              totalAmountWithDecimalsBN={totalAmountWithDecimalsBN}
            />
          )}
        </Box>
        {activeStep === steps.length && (
          <div>
            <Typography className={classes.instructions}>All steps completed!</Typography>
            <Button onClick={() => window.location.reload()} variant="contained" className={classes.button}>Reset</Button>
          </div>
        )}
      </div>
    </Box>
  );
}

export default Transfer;
