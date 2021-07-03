import React, { useMemo } from 'react';
import { Box } from '@material-ui/core';
import CustomTextField from './CustomTextField';

function TransferInfo({ activeStep, recipientInfo, transactionCount, setTransactionCount, totalAmount }) {
  const handleTransactionCountChange = (e) => {
    const value = e?.target?.value;
    const count = Number(value);
    if (!count || count < 1 || count > recipientInfo?.length) {
      return;
    }
    setTransactionCount(count);
  }

  const transferPerTransaction = useMemo(() => {
    const value = Math.floor(recipientInfo?.length / transactionCount);
    const mod = recipientInfo?.length % transactionCount;
    return mod === 0 ? value : value + 1;
  }, [recipientInfo, transactionCount]);

  return (
    <Box display="flex" justifyContent="center">
      <Box m={1}>
        <CustomTextField
          label="Total Recipients"
          disabled
          value={recipientInfo.length}
          style={{ width: "194px" }}
        />
      </Box>
      <Box m={1}>
        <CustomTextField
          label="Total Amount to Transfer"
          disabled
          value={totalAmount}
          style={{ width: "194px" }}
        />
      </Box>
      <Box m={1}>
        <CustomTextField
          label="Total Transaction Count"
          disabled={activeStep > 1}
          value={transactionCount}
          onChange={handleTransactionCountChange}
          type="number"
          style={{ width: "194px" }}
          helperText={`max ${transferPerTransaction} transfers per transaction`}
        />
      </Box>
    </Box>
  );
}

export default TransferInfo;
