import React, { useState, useEffect } from 'react';
import Spreadsheet from "react-spreadsheet";
import Box from '@material-ui/core/Box';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Web3Utils from "web3-utils";
import csv from 'csv';
import TableRow from "@material-ui/core/TableRow";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import {Link, Typography} from "@material-ui/core";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { makeStyles } from '@material-ui/core/styles';
import CustomButton from "./CustomButton";
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript";
import MultiTransferer from "../abis/MultiTransferer.json";
import CircularProgress from "@material-ui/core/CircularProgress";
import withStyles from "@material-ui/core/styles/withStyles";
import { CustomDialog, CustomDialogTitle } from "./CustomDialog";
import ErrorMessage from "./ErrorMessage";
import clsx from "clsx";

const useStyles = makeStyles(() => ({
  fileUpload: {
    cursor: 'pointer',
  },
  label: {
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 8,
  },
  button: {
    background: "#EC008C",
    height: 50,
    borderRadius: 25,
    minWidth: 150,
    fontSize: 18,
  },
  csvInput: {
    display: "none",
  },
  wrapper: {
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
    color: "#FFFFFF",
  },
  lineNumberCell: {
    color: "#00636C"
  },
  lineCell: {
    color: "#B10069",
  },
  tableContainer: {
    height: 400,
  },
  step1Table: {
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
  },
  discardButton: {
    color: "#ffffff",
    cursor: "pointer",
  },
  tokenApprovalErrorMessage: {
    color: "#f44336",
  },
}));

const CustomTableCell = withStyles(() => ({
  root: {
    border: "none",
  },
}))(TableCell);

const exampleCsv = [
  [{ value: "0x2ADfe76173F7e7DAef1463A83BA4d06171fAc454" }, { value: "100" }],
  [{ value: "0x092619459b1917d70ad78909962cb56603cb6831" }, { value: "1.5" }],
];

function CsvInfo({ web3, account, networkId, tokenInfo, setTokenInfo, validInputs, setValidInputs, setRecipientInfo, activeStep, setActiveStep, totalAmountWithDecimalsBN }) {
  const classes = useStyles();
  const [toast, setToast] = useState(null);
  const [showInputTokenAddressMessage, setShowInputTokenAddressMessage] = useState(false);
  const [showUploadCsvMessage, setShowUploadCsvMessage] = useState(false);
  const [isExampleCsvVisible, setIsExampleCsvVisible] = useState(false);
  const [invalidInputs, setInvalidInputs] = useState(null);
  const [editorValue, setEditorValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenApprovalErrorMessage, setTokenApprovalErrorMessage] = useState(null);

  const handleCloseToast = () => {
    setToast(null);
  };

  const validate = lines => {
    const addressMap = {};
    const invalidLines = [];
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      if (line.length !== 2) {
        invalidLines.push({ lineNumber, reason: "invalid data count", line });
        return;
      }
      const [address, amount] = line;
      if (!Web3Utils.isAddress(address)) {
        invalidLines.push({ lineNumber, reason: "invalid address", line });
      } else if (!Number(amount) || Number(amount) < 0) {
        invalidLines.push({ lineNumber, reason: "invalid amount", line });
      } else {
        const items = addressMap[address] || [];
        items.push({ lineNumber, line });
        addressMap[address] = items;
      }
    })
    const validLines = [];
    Object.entries(addressMap).forEach(([, items]) => {
      if (items.length === 1) {
        validLines.push(items[0]);
      } else {
        items.forEach(item => {
          invalidLines.push({ ...item, reason: "duplicate address" });
        });
      }
    })
    invalidLines.sort((a, b) => a.lineNumber - b.lineNumber);
    setInvalidInputs(invalidLines);
    setValidInputs(validLines);
    if (showUploadCsvMessage) {
      setShowUploadCsvMessage(false);
    }
  }

  useEffect(() => {
    if (!validInputs?.length) {
      setEditorValue("");
      return;
    }
    if (activeStep === 0) {
      const lines = validInputs?.map(({ line }) => line.join(","));
      setEditorValue(lines.join("\n"));
    } else if (activeStep === 1) {
      const lines = validInputs?.map(({ line }) => line.join("    "));
      setEditorValue(lines.join("\n"));
    }
  }, [validInputs, activeStep]);

  const onFileDrop = (event) => {
    const validFiles = [];
    const invalidFiles = [];
    Array.from(event?.target?.files).forEach(file => {
      if (file.name.endsWith(".csv")) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    })
    const reader = new FileReader();

    reader.onabort = () => console.error("file reading was aborted");
    reader.onerror = () => console.error("file reading failed");
    reader.onload = () => {
      // Parse CSV file
      csv.parse(reader.result, (error, data) => {
        validate(data);
      });
    };

    // read file contents
    validFiles.forEach(file => reader.readAsBinaryString(file));
    if (invalidFiles.length) {
      if (validFiles.length) {
        const invalidFileNames = invalidFiles.map(file => file.name).join(", ");
        setToast({ message: `Ignored invalid files: ${invalidFileNames}`, severity: "warning", isVisible: true });
      } else {
        setToast({ message: 'Please select only csv files', severity: "error", isVisible: true });
      }
    }
  }

  const handleClose = () => setInvalidInputs(null);

  const handleStep1ToStep2 = () => {
    if (!tokenInfo || !tokenInfo.address) {
      setTokenInfo({ isValid: false, errorMessage: "Please input token address" });
      return;
    }

    if (!tokenInfo.isValid) {
      return;
    }

    if (!validInputs?.length) {
      setShowUploadCsvMessage(true);
      return;
    }
    const recipientInfo = validInputs.map(({ line }) => ({ address: line[0], amount: line[1] }));
    setRecipientInfo(recipientInfo);
    setActiveStep(1);
  }

  const approveTokenAndProceed = () => {
    const multiTransfererAddress = MultiTransferer.addresses[networkId];
    tokenInfo.contract.methods.approve(multiTransfererAddress, totalAmountWithDecimalsBN.toString())
      .send({ from: account })
      .on('transactionHash', hash => {
        // setApprovalTransactionHash(hash);
      })
      .on('error', (error) => {
        setTokenApprovalErrorMessage(error?.message ?? "failed to approve token");
        setIsLoading(false);
        console.error(error);
      })
      .then(response => {
        console.log("response", response);
        if (response?.status) {
          // setApprovalTransactionHash(response?.transactionHash);
          setActiveStep(2);
        }
      });
  }

  const handleStep2ToStep3 = () => {
    setIsLoading(true);
    const multiTransfererAddress = MultiTransferer.addresses[networkId];
    tokenInfo.contract.methods.allowance(account, multiTransfererAddress).call()
      .then(allowance => {
        console.log("allowance", allowance);
        if (new web3.utils.BN(allowance).gte(totalAmountWithDecimalsBN)) {
          setActiveStep(2);
        } else {
          approveTokenAndProceed();
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  const handleBack = () => {
    setTokenApprovalErrorMessage(null);
    setActiveStep(0);
  }

  const handleNext = () => {
    if (activeStep === 0) {
      handleStep1ToStep2();
    } else if (activeStep === 1) {
      handleStep2ToStep3();
    }
  }

  const onCodeMirrorChange = (editor, data, value) => {
    // console.log(value);
    setEditorValue(value);
  }

  const discard = () => {
    setValidInputs(null);
    setTokenInfo({ ...tokenInfo, notEnoughBalance: false })
  }

  const openExampleCsv = () => setIsExampleCsvVisible(true);

  const closeExampleCsv = () => setIsExampleCsvVisible(false);

  const onClickUploadCsv = e => {
    if (!tokenInfo?.address) {
      e.nativeEvent.preventDefault();
      setShowInputTokenAddressMessage(true);
    }
  }

  const hideInputTokenAddressMessage = () => setShowInputTokenAddressMessage(false);

  return (
    <>
      <Box display="flex" justifyContent="center" flexDirection="column" p={1} mb={2}>
        <Box display="flex" justifyContent={activeStep === 0 ? "space-between" : "flex-start"} alignItems="center">
          <Typography className={classes.label}>{activeStep === 0 ? "List of Addresses in CSV" : "Imported lines"}</Typography>
          {activeStep === 0 && (
            !!editorValue ? (
              <Link onClick={discard} className={classes.discardButton}>
              Discard
            </Link>
            ) : (
              <Link onClick={openExampleCsv} className={classes.discardButton}>
                Example CSV
              </Link>
            )
          )}
        </Box>
        <CodeMirror
          value={editorValue}
          options={{
            lineNumbers: true,
            readOnly: true,
          }}
          onChange={onCodeMirrorChange}
          className={clsx({ "Step2-line": activeStep === 1, "error": !invalidInputs?.length && showUploadCsvMessage })}
        />
        {!invalidInputs?.length && showUploadCsvMessage && <ErrorMessage text="Please upload csv file" />}
        {activeStep === 0 && (
          <Box display="flex" justifyContent="flex-start" mt={4}>
            <input
              accept=".csv"
              className={classes.csvInput}
              id="csv-upload"
              onChange={onFileDrop}
              onClick={e => e.target.value = null}
              type="file"
            />
            <label htmlFor="csv-upload">
              <CustomButton onClick={onClickUploadCsv} variant="contained" color="primary" component="span">
                Upload CSV file
              </CustomButton>
            </label>
          </Box>
        )}
      </Box>
      <Snackbar open={toast?.isVisible} autoHideDuration={6000} onClose={handleCloseToast} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <MuiAlert onClose={handleCloseToast} severity={toast?.severity}>
          {toast?.message}
        </MuiAlert>
      </Snackbar>
      {showInputTokenAddressMessage && (
        <CustomDialog onClose={hideInputTokenAddressMessage} open={showInputTokenAddressMessage} maxWidth="md">
          <CustomDialogTitle onClose={hideInputTokenAddressMessage}>
            Token address is required
          </CustomDialogTitle>
          <DialogContent>
            <Typography>Please input token address to proceed</Typography>
          </DialogContent>
          <DialogActions>
            <Box m={2}>
              <CustomButton autoFocus onClick={hideInputTokenAddressMessage} variant="contained" color="primary">
                OK
              </CustomButton>
            </Box>
          </DialogActions>
        </CustomDialog>
      )}
      {isExampleCsvVisible && (
        <CustomDialog onClose={closeExampleCsv} open={isExampleCsvVisible} maxWidth="md">
          <CustomDialogTitle onClose={closeExampleCsv}>
            Example CSV
          </CustomDialogTitle>
          <DialogContent>
            <Box my={1}>
              <Typography>Input recipient wallet address at 1st column, token amount at 2nd column</Typography>
            </Box>
            <Spreadsheet data={exampleCsv} />
          </DialogContent>
          <DialogActions>
            <Box m={2}>
              <CustomButton autoFocus onClick={closeExampleCsv} variant="contained" color="primary">
                OK
              </CustomButton>
            </Box>
          </DialogActions>
        </CustomDialog>
      )}
      {!!invalidInputs?.length && (
        <CustomDialog onClose={handleClose} open={!!invalidInputs?.length} fullWidth={true} maxWidth="md">
          <CustomDialogTitle onClose={handleClose}>
            Invalid inputs below will be ignored
          </CustomDialogTitle>
          <DialogContent>
            <Table size="small">
              <TableBody>
                {invalidInputs.map(({ lineNumber, reason, line }) => (
                  <TableRow key={lineNumber}>
                    <CustomTableCell className={classes.lineNumberCell}>{lineNumber}</CustomTableCell>
                    <CustomTableCell className={classes.lineCell}>{line.join(",")}</CustomTableCell>
                    <CustomTableCell className={classes.lineCell}>{reason}</CustomTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Box m={2}>
              <CustomButton autoFocus onClick={handleClose} variant="contained" color="primary">
                OK
              </CustomButton>
            </Box>
          </DialogActions>
        </CustomDialog>
      )}
      <Box display="flex" justifyContent="center" mt={1} alignItems="center" flexDirection="column">
        {!isLoading && tokenApprovalErrorMessage && (
          <Box m={2}>
            <ErrorMessage text={tokenApprovalErrorMessage} />
          </Box>
        )}
        <Box display="flex" justifyContent="center">
          {activeStep === 1 && (
            <CustomButton onClick={handleBack}>
              Back
            </CustomButton>
          )}
          <div className={classes.wrapper}>
            <CustomButton
              variant="contained"
              color="primary"
              disabled={isLoading || (activeStep === 1 && tokenInfo?.notEnoughBalance)}
              onClick={handleNext}
            >
              Next
            </CustomButton>
            {isLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
        </Box>
      </Box>
    </>
  );
}

export default CsvInfo;
