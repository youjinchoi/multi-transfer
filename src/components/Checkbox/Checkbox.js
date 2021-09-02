import MaterialCheckbox from "@material-ui/core/Checkbox";
import withStyles from "@material-ui/core/styles/withStyles";

const Checkbox = withStyles({
  checked: {
    color: "#EC008C !important",
  },
})(MaterialCheckbox);

export default Checkbox;
