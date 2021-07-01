import React, { useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CsvInfo from './CsvInfo';
import TransactionInfo from './TransactionInfo';
import { Box, Button, Divider, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
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
}));

function getSteps() {
  return ['Input transfer details', 'Review', 'Transfer'];
}

function Transfer({ web3, account }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [validInputs, setValidInputs] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [transactionCount, setTransactionCount] = useState(1);
  const steps = getSteps();

  const totalAmount = useMemo(() => recipientInfo?.reduce(
    (acc, val) => (acc + Number(val.amount)), 0
    )
    , [recipientInfo]);

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
        <Box>
          <TokenInfo
            web3={web3}
            account={account}
            activeStep={activeStep}
            tokenInfo={tokenInfo}
            setTokenInfo={setTokenInfo}
          />
          <Box display="flex" justifyContent="center" m={1}>
            <Box my={2} style={{ width: "612px" }}>
              <Divider />
            </Box>
          </Box>
          {activeStep > 0 && (
            <TransferInfo
              activeStep={activeStep}
              recipientInfo={recipientInfo}
              totalAmount={totalAmount}
              transactionCount={transactionCount}
              setTransactionCount={setTransactionCount}
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
              recipientInfo={recipientInfo}
              setActiveStep={setActiveStep}
              transactionCount={transactionCount}
              totalAmount={totalAmount}
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
              totalAmount={totalAmount}
              transferPerTransaction={transferPerTransaction}
            />
          )}
        </Box>
        {activeStep === steps.length && (
          <div>
            <Typography className={classes.instructions}>All steps completed!</Typography>
            <Button onClick={() => window.location.reload()} variant="contained" color="primary">Reset</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transfer;
