import React, { useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  table: {
    width: 612,
  },
});

function TransferApprove({ recipientInfo, setActiveStep, transactionCount, totalAmount, handleTransactionCountChange, transferPerTransaction }) {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!recipientInfo) {
    return null;
  }

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, recipientInfo.length - page * rowsPerPage);

  return (
    <Box display="flex" alignItems="center" flexDirection="column">
      <Box display="flex" justifyContent="center">
        <Box m={1}>
          <TextField
            label="Total Recipients"
            disabled
            value={recipientInfo.length}
            style={{ width: "296px" }}
          />
        </Box>
        <Box m={1}>
          <TextField
            label="Total Amount to Transfer"
            disabled
            value={totalAmount}
            style={{ width: "296px" }}
          />
        </Box>
      </Box>
      <Box display="flex" justifyContent="center">
        <Box m={1}>
          <TextField
            label="Current BNB Balance"
            disabled
            value={totalAmount}
            style={{ width: "296px" }}
          />
        </Box>
        <Box m={1}>
          <TextField
            label="Total Transaction Count"
            value={transactionCount}
            onChange={handleTransactionCountChange}
            type="number"
            style={{ width: "296px" }}
            helperText={`max ${transferPerTransaction} transfers per transaction`}
          />
        </Box>
      </Box>
      <Box m={1}>
        <TableContainer>
          <Table className={classes.table} stickyHeader size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell>Address</StyledTableCell>
                <StyledTableCell>Amount</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recipientInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(({ address, amount }) => (
                <StyledTableRow key={address}>
                  <StyledTableCell>{address}</StyledTableCell>
                  <StyledTableCell>{amount}</StyledTableCell>
                </StyledTableRow>
              ))}
              {!!emptyRows && page > 0 && [ ...Array(emptyRows).keys()].map(item => (
                <StyledTableRow key={`empty${item}`} style={{ height: 33 }}>
                  <TableCell colSpan={2} />
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 50, 100]}
          component="div"
          count={recipientInfo.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>
      <div>
        <Box m={1}>
          <Button onClick={() => setActiveStep(0)}>Back</Button>
          <Button variant="contained" color="primary" onClick={() => setActiveStep(2)}>
            Next
          </Button>
        </Box>
      </div>
    </Box>
  );
}

export default TransferApprove;
