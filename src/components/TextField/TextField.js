import React from "react";

import makeStyles from "@material-ui/core/styles/makeStyles";
import MaterialTextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "10px 20px !important",
    height: 50,
    border: "0.6px solid #E5E7EB",
    borderRadius: 15,
    background: "#F9FAFB",
    color: "#00636C",
    fontSize: 18,
  },
  input: {
    "&::placeholder": {
      color: "#00636C",
      opacity: 1,
    },
  },
  disabled: {
    color: "#00636C",
  },
  error: {
    border: "3px solid #CE596A",
    backgroundColor: "#FFEEF8",
    "& input": {
      color: "#B10015 !important",
    },
  },
}));

function TextField({ InputProps = {}, ...rest }) {
  const classes = useStyles();
  const { classes: inputClasses, ...restInputProps } = InputProps;

  return (
    <MaterialTextField
      InputProps={{
        classes: { ...inputClasses, ...classes },
        disableUnderline: true,
        ...restInputProps,
      }}
      {...rest}
    />
  );
}

export default TextField;
