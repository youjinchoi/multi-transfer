import MaterialDialog from "@material-ui/core/Dialog";
import MaterialDialogTitle from "@material-ui/core/DialogTitle";
import withStyles from "@material-ui/core/styles/withStyles";

export const Dialog = withStyles({
  paperScrollPaper: {
    borderRadius: 15,
  },
})(MaterialDialog);

export const DialogTitle = withStyles(() => ({
  root: {
    fontSize: 18,
    color: "#00636C",
  },
}))(MaterialDialogTitle);
