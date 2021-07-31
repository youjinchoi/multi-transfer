import React from 'react';
import {Box, Typography} from '@material-ui/core';
import CustomTextField from './CustomTextField';
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  label: {
    marginTop: 8,
    marginBottom: 8,
  },
  inputAlignCenter: {
    width: 180,
    "& div": {
      backgroundColor: "#FFE267",
      border: "0.6px solid #E5E7EB",
    },
    "& input": {
      textAlign: "center",
      fontWeight: "bold",
    },
  },
}));


function TransferInfo({ recipientInfo, totalAmount }) {
  const classes = useStyles();
  return (
    <Box display="flex" justifyContent="center">
      <Box m={1}>
        <Typography className={classes.label}>Total Recipients</Typography>
        <CustomTextField
          disabled
          value={recipientInfo.length}
          className={classes.inputAlignCenter}
        />
      </Box>
      <Box m={1}>
        <Typography className={classes.label}>Total Amount to Transfer</Typography>
        <CustomTextField
          disabled
          value={totalAmount}
          className={classes.inputAlignCenter}
        />
      </Box>
    </Box>
  );
}

export default TransferInfo;
