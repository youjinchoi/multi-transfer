import TextField from '@material-ui/core/TextField';
import makeStyles from "@material-ui/core/styles/makeStyles";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 10,
    height: 50,
    border: "0.6px solid #E5E7EB",
    borderRadius: 15,
    background: "#F9FAFB",
    color: '#00636C',
  },
  'input': {
    '&::placeholder': {
      color: '#00636C',
      opacity: 1,
    }
  }
}));

function CustomTextField(props) {
  const classes = useStyles();

  return (
    <TextField
      InputProps={{
        classes,
        disableUnderline: true,
      }}
      {...props}
    />
  );
}

export default CustomTextField;
