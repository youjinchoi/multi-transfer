import TextField from '@material-ui/core/TextField';
import makeStyles from "@material-ui/core/styles/makeStyles";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "10px 20px",
    height: 50,
    border: "0.6px solid #E5E7EB",
    borderRadius: 15,
    background: "#F9FAFB",
    color: '#00636C',
    fontSize: 18,
  },
  'input': {
    '&::placeholder': {
      color: '#00636C',
      opacity: 1,
    }
  },
  disabled: {
    color: "#00636C",
  },
  error: {
    border: "2px solid #f44336",
  }
}));

function CustomTextField({ InputProps, ...rest}) {
  const classes = useStyles();

  return (
    <TextField
      InputProps={{
        classes: {...InputProps?.classes, ...classes},
        disableUnderline: true,
      }}
      {...rest}
    />
  );
}

export default CustomTextField;
