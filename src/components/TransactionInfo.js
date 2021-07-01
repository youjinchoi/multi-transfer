import React, { useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, CircularProgress, Step, StepLabel, Stepper, StepContent, Typography, Link } from '@material-ui/core';
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

const steps = ['Approve token', 'Execute multi transfers'];

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

const TransactionStepIcon = (props) => {
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

const multiTransfererAddress = "0xb6d28133Abebe1F3C93e9D364502F1A98878A65d";

function TransactionInfo({ web3, account, tokenInfo, recipientInfo, setActiveStep: setGlobalActiveStep, transactionCount, totalAmount, transferPerTransaction }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [isEnoughAllowances, setIsEnoughAllowances] = useState(false);
  const [approvalTransactionHash, setApprovalTransactionHash] = useState(null);
  const [tokenApprovalErrorMessage, setTokenApprovalErrorMessage] = useState(null);
  const [transferTransactionHashes, setTransferTransactionHashes] = useState({});
  const [transferTransactionErrorMessages, setTransferTransactionErrorMessages] = useState([]);

  const decimalsBN = new web3.utils.BN(tokenInfo.decimals);
  const multiplierBN = new web3.utils.BN(10).pow(decimalsBN);
  const totalAmountBN = new web3.utils.BN(totalAmount);
  const totalAmountWithDecimalsBN = totalAmountBN.mul(multiplierBN);

  useEffect(() => {
    if (activeStep === 1) {
      const statuses = Object.values(transferTransactionHashes);
      if (statuses.length === transactionCount && statuses.every(status => status === "finish")) {
        setActiveStep(2);
        setGlobalActiveStep(3);
        /*
        Object.keys(transferTransactionHashes).forEach(transactionHash => {
          web3.eth.getTransactionReceipt(transactionHash, (error, res) => {
            console.log(res);
          })
        })
        */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, transactionCount, transferTransactionHashes]);

  useEffect(() => {
    const approveToken = async () => {
      const allowance = await tokenInfo.contract.methods.allowance(account, multiTransfererAddress).call();
      if (new web3.utils.BN(allowance).gte(totalAmountWithDecimalsBN)) {
        setIsEnoughAllowances(true);
        setActiveStep(1);
        return;
      }

      try {
        tokenInfo.contract.methods.approve(multiTransfererAddress, totalAmountWithDecimalsBN.toString())
          .send({ from: account })
          .on('transactionHash', hash => {
            setApprovalTransactionHash(hash);
          })
          .then(response => {
            if (response?.status) {
              setApprovalTransactionHash(response?.transactionHash);
              setActiveStep(1);
            }
          });
      } catch (error) {
        setTokenApprovalErrorMessage(error?.message ?? "failed to approve token");
        console.error(error);
      }
    };

    const multiTransfer = async () => {
      const multiTransferer = new web3.eth.Contract(MultiTransferer.abi, multiTransfererAddress);
      const chunks = chunk(recipientInfo, transferPerTransaction);
      let tempTransactionHashes = {};
      const tempTransactionErrorMessages = [];
      chunks.forEach(async chunk => {
        const addresses = [];
        const amounts = [];
        chunk.forEach(({ address, amount }) => {
          addresses.push(address);
          const amountBN = new web3.utils.BN(amount);
          amounts.push(amountBN.mul(multiplierBN).toString());
        })

        const encodedData = await multiTransferer.methods.multiTransferToken(tokenInfo.address, addresses, amounts).encodeABI({from: account});
        const gas = await web3.eth.estimateGas({
          from: account,
          data: encodedData,
          to: multiTransfererAddress,
        });

        console.log('gas', gas);

        try {
          multiTransferer.methods.multiTransferToken(tokenInfo.address, addresses, amounts)
            .send({ from: account })
            .on('transactionHash', hash => {
              tempTransactionHashes = {...tempTransactionHashes, [hash]: "pending" };
              setTransferTransactionHashes(tempTransactionHashes);
            })
            .on('error', (error) => {
              tempTransactionErrorMessages.push(error?.message ?? "failed to multi transfer");
              setTransferTransactionErrorMessages([...tempTransactionErrorMessages]);
            })
            .then(result => {
              if (result?.status && result?.transactionHash) {
                tempTransactionHashes = {...tempTransactionHashes, [result?.transactionHash]: "finish" };
                setTransferTransactionHashes(tempTransactionHashes);
              }
            });
        } catch (error) {
          tempTransactionErrorMessages.push(error?.message ?? "failed to multi transfer");
          setTransferTransactionErrorMessages([...tempTransactionErrorMessages]);
          console.error(error);
        }
      });
    }
    switch (activeStep) {
      case 0:
        approveToken();
        break;
      case 1:
        multiTransfer();
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  const getError = index => {
    if (index === 0) {
      return !!tokenApprovalErrorMessage;
    } else if (index === 1) {
      return transferTransactionErrorMessages.length === transactionCount;
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
      } else if (isEnoughAllowances) {
        return (
          <Typography variant="caption">
            Already have enough allowances
          </Typography>
        );
      } else if (!!approvalTransactionHash) {
        return (
          <Typography variant="caption">
            <Link href={`https://testnet.bscscan.com/tx/${approvalTransactionHash}`} target="_blank">{approvalTransactionHash}</Link>
          </Typography>
        );
      }
    } else if (index === 1) {
      if (transferTransactionErrorMessages.length === transactionCount) {
        return (
          <Box display="flex" flexDirection="column">
            {transferTransactionErrorMessages.map(message => (
              <Typography variant="caption" color="error">
                {message}
              </Typography>
            ))}
          </Box>
        );
      }
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

  return (
    <Box className={classes.root} display="flex" flexDirection="column" alignItems="center">
      <Box style={{ width: "612px" }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                error={getError(index)}
                optional={getOptional(index)}
                StepIconComponent={TransactionStepIcon}
              >
                {label}
              </StepLabel>
              <StepContent />
            </Step>
          ))}
        </Stepper>
        {activeStep < 2 && (
          <Box display="flex" justifyContent="center">
            <Box m={1}>
              <Button
                onClick={() => setGlobalActiveStep(1)}
                disabled={!!Object.keys(transferTransactionHashes)?.length}
              >
                Back
              </Button>
              <Button variant="contained" color="primary" disabled>
                Next
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default TransactionInfo;
