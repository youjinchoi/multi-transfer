import React from 'react';
import { Box } from '@material-ui/core';
import CustomTextField from './CustomTextField';

function TransferInfo({ recipientInfo, totalAmount }) {
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
    </Box>
  );
}

export default TransferInfo;
