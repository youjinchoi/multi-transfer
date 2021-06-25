import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Dropzone from 'react-dropzone';
import Web3Utils from "web3-utils";
import csv from 'csv';
import TableRow from "@material-ui/core/TableRow";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import {Typography} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

const defaultProps = {
  bgcolor: 'background.paper',
  borderColor: 'rgba(0, 0, 0, 0.38)',
  m: 1,
  border: 1,
  style: { width: '612px', height: '200px' },
};

function TransferInput({ web3, tokenInfo, setTokenInfo, setRecipientInfo, setActiveStep }) {
  const [toast, setToast] = useState(null);
  const [invalidInputs, setInvalidInputs] = useState(null);
  const [validInputs, setValidInputs] = useState(null);

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
  }

  const onFileDrop = (acceptedFiles) => {
    const validFiles = [];
    const invalidFiles = [];
    acceptedFiles.forEach(file => {
      if (file.type === "text/csv") {
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

  const handleNext = () => {
    if (!tokenInfo) {
      setTokenInfo({ isValid: false, errorMessage: "Please input the token address" });
      return;
    }
    if (!validInputs?.length) {
      return;
    }
    const recipientInfo = validInputs.map(({ line }) => ({ address: line[0], amount: line[1] }));
    setRecipientInfo(recipientInfo);
    setActiveStep(1);
  }

  return (
    <>
      {!invalidInputs?.length && !validInputs?.length && (
        <Box display="flex" justifyContent="center">
          <Dropzone onDrop={onFileDrop}>
            {({getRootProps, getInputProps}) => (
              <Box borderRadius={4} {...defaultProps} display="flex" flexDirection="row" justifyContent="center" alignItems="center">
                <div {...getRootProps()}>
                  <input {...getInputProps()} accept=".csv" />
                  <p>Drag 'n' drop csv files here, or click to select files</p>
                  <CloudUploadIcon color="primary" style={{ fontSize: 50 }} />
                </div>
              </Box>
            )}
          </Dropzone>
        </Box>
      )}
      <Snackbar open={toast?.isVisible} autoHideDuration={6000} onClose={handleCloseToast} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <MuiAlert onClose={handleCloseToast} severity={toast?.severity}>
          {toast?.message}
        </MuiAlert>
      </Snackbar>
      {invalidInputs?.length && (
        <Dialog onClose={handleClose} open={!!invalidInputs?.length} fullWidth={true} maxWidth="md">
          <DialogTitle id="customized-dialog-title" onClose={handleClose}>
            Invalid inputs below will be ignored
          </DialogTitle>
          <DialogContent dividers>
            <Table size="small">
              <TableBody>
                {invalidInputs.map(({ lineNumber, reason, line }) => (
                  <TableRow key={lineNumber}>
                    <TableCell>{`line ${lineNumber}`}</TableCell>
                    <TableCell>{line.join(",")}</TableCell>
                    <TableCell>{reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleClose} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {!!validInputs?.length && (
        <Box display="flex" alignItems="center" flexDirection="column" m={2}>
          <Box display="flex" justifyContent="space-between" style={{ width: "612px"}}>
            <Typography>Imported lines</Typography>
            <Button variant="contained" onClick={() => setValidInputs(null)}>
              Discard
            </Button>
          </Box>
          <Table size="small" style={{ width: "612px"}}>
            <TableBody>
              {validInputs.map(({lineNumber, line}) => (
                <TableRow key={lineNumber}>
                  <TableCell>{`line ${lineNumber}`}</TableCell>
                  <TableCell>{line.join(",")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
      <Box m={1}>
        <Button
          disabled
        >
          Back
        </Button>
        <Button variant="contained" color="primary" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </>
  );
}

export default TransferInput;
