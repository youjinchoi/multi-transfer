import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";

const CustomButton = withStyles({
  root: {
    borderRadius: 25,
    textTransform: "unset",
    color: "#FFFFFF",
    fontSize: 16,
    height: 50,
    minWidth: 120,
  },
  contained: {
    backgroundColor: '#EC008C',
    '&:hover': {
      backgroundColor: '#EC008C',
      borderColor: '#0062cc',
    },
  },
})(Button);

export default CustomButton;
