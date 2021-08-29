import Checkbox from "@material-ui/core/Checkbox";
import withStyles from "@material-ui/core/styles/withStyles";

const CustomCheckbox = withStyles({
  checked: {
    color: "#EC008C !important",
  },
})(Checkbox);

export default CustomCheckbox;
