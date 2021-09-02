import React, { useMemo } from "react";

import { Box, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import TextField from "../../components/TextField";

const useStyles = makeStyles((theme) => ({
  label: {
    marginTop: 8,
    marginBottom: 8,
  },
  transferInfoGrid: {
    display: "flex",
    flexDirection: "column",
    width: 190,
  },
  inputAlignCenter: {
    width: "100%",
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
  const isGrid = useMediaQuery("(min-width: 620px)");

  const uniqueRecipientCount = useMemo(() => {
    const recipientSet = new Set(
      recipientInfo?.map((recipient) => recipient.address)
    );
    return recipientSet.size;
  }, [recipientInfo]);

  return (
    <Box display={isGrid ? "flex" : "block"} justifyContent="center">
      <Box m={1} className={isGrid && classes.transferInfoGrid}>
        <Typography className={classes.label}>Total Recipients</Typography>
        <TextField
          disabled
          value={uniqueRecipientCount}
          className={classes.inputAlignCenter}
        />
      </Box>
      <Box m={1} className={isGrid && classes.transferInfoGrid}>
        <Typography className={classes.label}>
          Total Amount to Transfer
        </Typography>
        <TextField
          disabled
          value={totalAmount}
          className={classes.inputAlignCenter}
        />
      </Box>
    </Box>
  );
}

export default TransferInfo;
