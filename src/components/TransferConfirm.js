import React, { useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';
import Check from '@material-ui/icons/Check';
import chunk from "lodash/chunk";
import MultiTransferer from "../abis/MultiTransferer.json";

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
}));

const steps = ['Approve token', 'Confirm batch transfers', 'Wait for the transactions to be finished'];

const useQontoStepIconStyles = makeStyles({
  root: {
    color: '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
  },
  active: {
    color: '#784af4',
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
  completed: {
    color: '#784af4',
    zIndex: 1,
    fontSize: 18,
  },
});

const QontoStepIcon = (props) => {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  return (
    <Box display="flex" alignItems="center" style={{ height: 22, paddingLeft: 3 }}>
      {completed &&  <Check className={classes.completed} />}
      {active && <CircularProgress style={{ width: 18, height: 18 }}/>}
      {!completed && !active && <div className={classes.circle} style={{ marginLeft: 6 }} />}
    </Box>
  );
}

const multiTransfererAddress = "0xdfE3AaA9475F0e65C6A09ED04537F46D1836426F";

function TransferConfirm({ web3, account, tokenInfo, recipientInfo, setActiveStep: setGlobalActiveStep, transactionCount, totalAmount, handleTransactionCountChange, transferPerTransaction }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [approvalTransactionHash, setApprovalTransactionHash] = useState(null);
  const [transferTransactionHashes, setTransferTransactionHashes] = useState({});
  const [tokenApprovalErrorMessage, setTokenApprovalErrorMessage] = useState(null);

  const handleReset = () => {
    setGlobalActiveStep(0);
  };

  const decimalsBN = new web3.utils.BN(tokenInfo.decimals);
  const multiplierBN = new web3.utils.BN(10).pow(decimalsBN);
  const totalAmountBN = new web3.utils.BN(totalAmount);
  const totalAmountWithDecimalsBN = totalAmountBN.mul(multiplierBN);

  useEffect(() => {
    if (activeStep === 1) {
      if (Object.keys(transferTransactionHashes).length === transactionCount) {
        setActiveStep(2);
      }
    } else if (activeStep === 2) {
      console.log(transferTransactionHashes);
      if (!Object.values(transferTransactionHashes).every(status => status === "finish")) {
        Object.keys(transferTransactionHashes).forEach(transactionHash => {
          web3.eth.getTransactionReceipt(transactionHash, (error, res) => {
            console.log(res);
          })
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, transactionCount, transferTransactionHashes]);

  useEffect(() => {
    const approveToken = async () => {
      try {
        const allowance = await tokenInfo.contract.methods.allowance(account, multiTransfererAddress).call();
        // console.log(allowance, totalAmountBN.toString(), totalAmountWithDecimalsBN.toString());
        if (new web3.utils.BN(allowance).gte(totalAmountWithDecimalsBN)) {
          // console.log("enough allowances");
          setActiveStep(1);
          return;
        }
      } catch {}

      try {
        const response = await tokenInfo.contract.methods.approve(multiTransfererAddress, totalAmountWithDecimalsBN.toString())
          .send({ from: account });
        // console.log(response);
        if (response?.status) {
          setApprovalTransactionHash(response?.transactionHash);
          setActiveStep(1);
        }
      } catch (error) {
        setTokenApprovalErrorMessage(error?.message ?? "failed to approve token");
        console.error(error);
      }
    };

    const multiTransfer = async () => {
      const multiTransferer = new web3.eth.Contract(MultiTransferer.abi, multiTransfererAddress);
      const chunks = chunk(recipientInfo, transferPerTransaction);
      chunks.forEach(async chunk => {
        const addresses = [];
        const amounts = [];
        chunk.forEach(({ address, amount }) => {
          addresses.push(address);
          const amountBN = new web3.utils.BN(amount);
          amounts.push(amountBN.mul(multiplierBN).toString());
        })

        const encodedData = await multiTransferer.methods.multiTransferToken(tokenInfo.address, addresses, amounts, totalAmountWithDecimalsBN.toString()).encodeABI({from: account});
        const gas = await web3.eth.estimateGas({
          from: account,
          data: encodedData,
          to: multiTransfererAddress
        });
        console.log('gas', gas);

        const promise = multiTransferer.methods.multiTransferToken(tokenInfo.address, addresses, amounts, totalAmountWithDecimalsBN.toString())
          .send({ from: account })
          .on('transactionHash', hash => {
            // console.log("transactionHash", hash);
            setTransferTransactionHashes({...transactionCount, [hash]: "panding"})
          }).then(result => {
            if (result?.status && result?.transactionHash) {
              setTransferTransactionHashes({...transactionCount, [result?.transactionHash]: "finish"})
            }
          });
        console.log(promise);
      });
    }
    switch (activeStep) {
      case 0:
        approveToken();
        break;
      case 1:
        multiTransfer();
        break;
      case 2:
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  const getError = index => {
    if (index === 0) {
      return !!tokenApprovalErrorMessage;
    }
    return false;
  };

  const getOptional = index => {
    if (index === 0) {
      if (!!tokenApprovalErrorMessage) {
        return (
          <Typography variant="caption" color="error">
            {tokenApprovalErrorMessage}
          </Typography>
        );
      } else if (!!approvalTransactionHash) {
        return (
          <Typography variant="caption">
            <Link href={`https://testnet.bscscan.com/tx/${approvalTransactionHash}`} target="_blank">{approvalTransactionHash}</Link>
          </Typography>
        );
      }
    } else if (index === 2) {
      return (
        <Box display="flex" flexDirection="column">
          {Object.entries(transferTransactionHashes).map(([transactionHash, status]) => (
            <Typography variant="caption">
              <Link href={`https://testnet.bscscan.com/tx/${transactionHash}`} target="_blank">{transactionHash}</Link>
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  // console.log(approvalTransactionHash);

  return (
    <Box className={classes.root} display="flex" flexDirection="column" alignItems="center">
      <Box style={{ width: "612px" }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                error={getError(index)}
                optional={getOptional(index)}
                StepIconComponent={QontoStepIcon}
              >
                {label}
              </StepLabel>
              <StepContent />
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>All steps completed</Typography>
            <Button onClick={handleReset}>
              Reset
            </Button>
          </Paper>
        )}
      </Box>
      <Box display="flex" justifyContent="center">
        <Box m={1}>
          <Button
            onClick={() => setGlobalActiveStep(1)}
          >
            Back
          </Button>
          <Button variant="contained" color="primary" disabled>
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default TransferConfirm;
