import Dialog from "@material-ui/core/Dialog";
import withStyles from "@material-ui/core/styles/withStyles";
import DialogTitle from "@material-ui/core/DialogTitle";

export const CustomDialog = withStyles({
  paperScrollPaper: {
    borderRadius: 15,
  },
})(Dialog);

export const CustomDialogTitle = withStyles(() => ({
  root: {
    fontSize: 18,
    color: "#00636C",
  },
}))(DialogTitle);
