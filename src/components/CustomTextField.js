import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

const CustomTextField = withStyles({
  root: {
    '& label.Mui-disabled': {
      color: 'green',
    },
    '& .Mui-disabled': {
      '& input': {
        color: 'black',
      },
      '& fieldset': {
        borderColor: 'green !important',
        color: 'green',
      },
      '&.MuiInput-underline:before': {
        borderBottomColor: 'green',
        borderBottomStyle: 'solid',
      },
    },
  },
})(TextField);

export default CustomTextField;
