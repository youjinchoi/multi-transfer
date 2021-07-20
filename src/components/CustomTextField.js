import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

const CustomTextField = withStyles({
  root: {
    '& label.Mui-disabled': {
      color: 'green',
    },
    '& label.Mui-error': {
      color: 'red !important',
    },
    '& .Mui-disabled': {
      '& input': {
        color: 'black',
      },
      '& fieldset': {
        borderColor: 'green',
        color: 'green',
      },
      '&.MuiInput-underline:before': {
        borderBottomColor: 'green',
        borderBottomStyle: 'solid',
      },
    },
    '& .Mui-error': {
      '& fieldset': {
        borderColor: 'red !important',
        color: 'red !important',
      },
      '&.MuiInput-underline:before': {
        borderBottomColor: 'red !important',
        borderBottomStyle: 'solid',
      },
    },
  },
})(TextField);

export default CustomTextField;
