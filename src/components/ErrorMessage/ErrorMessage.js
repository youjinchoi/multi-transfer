import React from "react";

import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ErrorIcon from "@material-ui/icons/Error";

const useStyles = makeStyles(() => ({
  box: {
    backgroundColor: "#B10015",
    color: "#FFFFFF",
    width: "fit-content",
    borderRadius: 8,
    padding: "4px 8px",
    margin: "8px 0",
  },
  icon: {
    fontSize: "1.3rem",
    marginRight: 4,
  },
}));

function ErrorMessage({ text }) {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="row" className={classes.box}>
      <ErrorIcon className={classes.icon} />
      <Typography variant="body2">{text}</Typography>
    </Box>
  );
}

export default ErrorMessage;
