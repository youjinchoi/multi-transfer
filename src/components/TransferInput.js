import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Dropzone from 'react-dropzone';
import Web3Utils from 'web3-utils';
import csv from 'csv';
import { getContractABI } from '../apis/bscscan';

const defaultProps = {
  bgcolor: 'background.paper',
  borderColor: 'rgba(0, 0, 0, 0.38)',
  m: 1,
  border: 1,
  style: { width: '612px', height: '200px' },
};

function TransferInput({ web3, tokenInfo, setTokenInfo, setRecipientInfo }) {
  const [isLoading, setIsLoading] = useState(false);

  const onTokenAddressChange = async (e) => {
    const value = e?.target?.value;
    if (!value || !Web3Utils.isAddress(value)) {
      console.log(`${value} is not an address`);
      return;
    }
    setIsLoading(true);
    const abi = await getContractABI(value);
    if (!abi) {
      setIsLoading(false);
      return;
    }
    const contract = new web3.eth.Contract(abi, value);
    const decimals = await contract.methods.decimals().call();
    const name = await contract.methods.name().call();
    const symbol = await contract.methods.symbol().call();
    setTokenInfo({ address: value, name, symbol, decimals });
    setIsLoading(false);
  }

  const onFileDrop = (acceptedFiles) => {
    const reader = new FileReader();

    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading failed");
    reader.onload = () => {
      // Parse CSV file
      csv.parse(reader.result, (err, data) => {
        console.log("Parsed CSV data: ", data);
        setRecipientInfo(data);
      });
    };

    // read file contents
    acceptedFiles.forEach(file => reader.readAsBinaryString(file));
  }

  return (
    <>
      <Box display="flex" justifyContent="center" m={1}>
          <TextField label="Token Address" variant="outlined" onChange={onTokenAddressChange} style={{ width: "612px" }}/>
      </Box>
      {isLoading && (
        <Box m={1}>
          <CircularProgress />
        </Box>
      )}
      {!!tokenInfo && (
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
        </>
      )}
      <Box display="flex" justifyContent="center">
        <Dropzone onDrop={onFileDrop}>
          {({getRootProps, getInputProps}) => (
            <Box borderRadius={4} {...defaultProps} display="flex" flexDirection="row" justifyContent="center" alignItems="center">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
                <CloudUploadIcon color="primary" style={{ fontSize: 50 }} />
              </div>
            </Box>
          )}
        </Dropzone>
      </Box>
    </>
  );
}

export default TransferInput;
