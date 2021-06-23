import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TransferInput from './TransferInput';
import TransferApprove from './TransferApprove';
import Box from '@material-ui/core/Box';

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
  return ['Input transfer details', 'Approve', 'Transfer'];
}

function Transfer({ web3 }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  useEffect(() => {
    if (tokenInfo && recipientInfo) {
      handleNext();
    }
  }, [tokenInfo, recipientInfo])

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>All steps completed</Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <Box>
            {activeStep === 0 && (
              <TransferInput web3={web3} tokenInfo={tokenInfo} setTokenInfo={setTokenInfo} setRecipientInfo={setRecipientInfo} />
            )}
            {activeStep === 1 && (
              <TransferApprove web3={web3} recipientInfo={recipientInfo} />
            )}
            <div>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.backButton}
              >
                Back
              </Button>
              <Button variant="contained" color="primary" onClick={handleNext}>
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </Box>
        )}
      </div>
    </div>
  );
}

export default Transfer;
