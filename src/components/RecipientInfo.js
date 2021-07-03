import React, { useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Box, Button, TablePagination, TableRow, TableHead, TableContainer, TableCell, TableBody, Table } from '@material-ui/core';

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

function RecipientInfo({ recipientInfo, setActiveStep }) {
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
      <Box m={1}>
        <TableContainer style={{ borderRadius: 4 }}>
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

export default RecipientInfo;
