import React, { useMemo } from "react";

import { Box, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import TextField from "../../components/TextField";
import { numberWithCommas } from "../../utils";

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

function TransferInfo({ recipientInfo, totalAmountBN }) {
  const classes = useStyles();
  const isFullWidth = useMediaQuery("(max-width: 620px)");

  const uniqueRecipientCount = useMemo(() => {
    const recipientSet = new Set(
      recipientInfo?.map((recipient) => recipient.address)
    );
    return recipientSet.size;
  }, [recipientInfo]);

  return (
    <Box display={isFullWidth ? "block" : "flex"} justifyContent="center">
      <Box m={1} className={isFullWidth ? undefined : classes.transferInfoGrid}>
        <Typography className={classes.label}>Total Recipients</Typography>
        <TextField
          disabled
          value={numberWithCommas(uniqueRecipientCount)}
          className={classes.inputAlignCenter}
        />
      </Box>
      <Box m={1} className={isFullWidth ? undefined : classes.transferInfoGrid}>
        <Typography className={classes.label}>
          Total Amount to Transfer
        </Typography>
        <TextField
          disabled
          value={numberWithCommas(totalAmountBN?.toString())}
          className={classes.inputAlignCenter}
        />
      </Box>
    </Box>
  );
}

export default TransferInfo;
