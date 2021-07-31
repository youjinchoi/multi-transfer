import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CsvInfo from './CsvInfo';
import TransactionInfo from './TransactionInfo';
import { Box, Button, Divider, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import TokenInfo from "./TokenInfo";
import TransferInfo from "./TransferInfo";
import RecipientInfo from "./RecipientInfo";
import clsx from "clsx";

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
    width: 615,
  },
  stepLabel: {
    color: "#FFFFFF",
  },
  stepLabelUnderline: {
    width: 80,
    height: 5,
    backgroundColor: "#26CFDE",
  },
  welcomeMessage: {
    color: "#FFFFFF",
  },
  button: {
    background: "#EC008C",
  },
  divider: {
    backgroundColor: "#C1F4F7",
  },
  connector1: {
    position: "absolute",
    top: 13,
    left: 'calc(-90%)',
    right: 'calc(50%)',
    backgroundColor: "#fff",
    height: 3,
    "& :disabled": {
      backgroundColor: "84c4cc",
    }
  },
  connector2: {
    position: "absolute",
    top: 13,
    left: 'calc(-50%)',
    right: 'calc(10%)',
    backgroundColor: "#fff",
    height: 3,
  },
}));

const customStepLabelDefaultStyles = {
  root: {
    display: 'flex',
  }
}

const useCustomStepOneLabelStyles = makeStyles({
  ...customStepLabelDefaultStyles,
  iconContainer: {
    alignSelf: 'flex-start',
  },
  label: {
    textAlign: "start !important",
  }
});

const useCustomStepTwoLabelStyles = makeStyles({
  ...customStepLabelDefaultStyles,
});

const useCustomStepThreeLabelStyles = makeStyles({
  iconContainer: {
    alignSelf: 'flex-end',
  },
  label: {
    textAlign: "end !important",
  }
});

const useCustomStepIconStyles = makeStyles({
  root: {
    backgroundColor: '#00636C',
    zIndex: 1,
    color: "rgb(255, 255, 255, 0.6)",
    width: 30,
    height: 30,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#EC008C',
    color: '#fff',
  },
  completed: {
    backgroundColor: '#EC008C',
    color: '#fff',
  },
});

function CustomStepIcon(props) {
  const classes = useCustomStepIconStyles();
  const { active, completed } = props;

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
        [classes.completed]: completed,
      })}
    >
      <div className={classes.circle}>{props.icon}</div>
    </div>
  );
}

const steps = ['Input transfer details', 'Review', 'Transfer'];

function Transfer({ web3, account }) {
  const classes = useStyles();
  const customStepOneLabelStyles = useCustomStepOneLabelStyles();
  const customStepTwoLabelStyles = useCustomStepTwoLabelStyles();
  const customStepThreeLabelStyles = useCustomStepThreeLabelStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [validInputs, setValidInputs] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [transactionCount, setTransactionCount] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [totalAmountWithDecimalsBN, setTotalAmountWithDecimalsBN] = useState(null);

  const reset = () => {
    setActiveStep(0);
    setTokenInfo(null);
    setValidInputs(null);
    setRecipientInfo(null);
    setTransactionCount(null);
    setTotalAmount(null);
    setTotalAmountWithDecimalsBN(null);
  };

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

  const getCustomStepLabelStyle = index => {
    if (index === 0) {
      return customStepOneLabelStyles;
    } else if (index === 1) {
      return customStepTwoLabelStyles;
    } else if (index === 2) {
      return customStepThreeLabelStyles;
    } else {
      return null;
    }
  }

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" m={1} mb={8}>
      <Box my={2}>
        <Stepper activeStep={activeStep} alternativeLabel className={classes.stepper} connector={() => {}}>
          {steps.map((label, index) => (
            <Step key={label}>
              {index > 0 && <div style={index > activeStep ? { backgroundColor: "#84c4cc"} : {}} className={index === 1 ? classes.connector1 : classes.connector2} />}
              <StepLabel StepIconComponent={CustomStepIcon} classes={getCustomStepLabelStyle(index)}>
                <span className={classes.stepLabel} style={index > activeStep ? { opacity: 0.5 } : null }>{label}</span>
                {index <= activeStep && (
                  <Box display="flex" justifyContent={index === 0 ? "flex-start" : (index === 1 ? "center" : "flex-end")} m={1}>
                    <div className={classes.stepLabelUnderline} />
                  </Box>
                )}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Box m={1}>
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
            <>
              <Box mt={4} mb={2} px={1}>
                <Divider className={classes.divider} />
              </Box>
              <TransferInfo
                recipientInfo={recipientInfo}
                totalAmount={totalAmount}
              />
            </>
          )}
          {activeStep < 2 && (
            <CsvInfo
              web3={web3}
              account={account}
              tokenInfo={tokenInfo}
              setTokenInfo={setTokenInfo}
              validInputs={validInputs}
              setValidInputs={setValidInputs}
              setRecipientInfo={setRecipientInfo}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              totalAmountWithDecimalsBN={totalAmountWithDecimalsBN}
            />
          )}
          {false && (
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
              setRecipientInfo={setRecipientInfo}
              setActiveStep={setActiveStep}
              transactionCount={transactionCount}
              setTransactionCount={setTransactionCount}
              totalAmount={totalAmount}
              setTotalAmount={setTotalAmount}
              totalAmountWithDecimalsBN={totalAmountWithDecimalsBN}
              reset={reset}
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
