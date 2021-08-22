import React, { useState, useEffect } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import {
  Box,
  TablePagination,
  TableRow,
  TableHead,
  TableContainer,
  TableCell,
  TableBody,
  Table,
} from "@material-ui/core";
import MultiTransferer from "../abis/MultiTransferer.json";
import CustomButton from "./CustomButton";

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
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  table: {
    width: 612,
  },
});

function RecipientInfo({
  web3,
  account,
  networkId,
  recipientInfo,
  setActiveStep,
  tokenInfo,
  totalAmountWithDecimalsBN,
}) {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEnoughAllowances, setIsEnoughAllowances] = useState(false);
  // const [approvalTransactionHash, setApprovalTransactionHash] = useState(null);
  // const [tokenApprovalErrorMessage, setTokenApprovalErrorMessage] = useState(null);

  useEffect(() => {
    const multiTransfererAddress = MultiTransferer.addresses[networkId];
    tokenInfo.contract.methods
      .allowance(account, multiTransfererAddress)
      .call()
      .then((allowance) => {
        // console.log("allowance", allowance);
        if (new web3.utils.BN(allowance).gte(totalAmountWithDecimalsBN)) {
          setIsEnoughAllowances(true);
        }
      })
      .catch((error) => {
        console.error(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approveTokenAndProceed = () => {
    const multiTransfererAddress = MultiTransferer.addresses[networkId];
    tokenInfo.contract.methods
      .approve(multiTransfererAddress, totalAmountWithDecimalsBN.toString())
      .send({ from: account })
      .on("transactionHash", (hash) => {
        // setApprovalTransactionHash(hash);
      })
      .on("error", (error) => {
        // setTokenApprovalErrorMessage(error?.message ?? "failed to approve token");
        console.error(error);
      })
      .then((response) => {
        if (response?.status) {
          setIsEnoughAllowances(true);
          // setApprovalTransactionHash(response?.transactionHash);
          setActiveStep(2);
        }
      });
  };

  const handleNext = () => {
    if (isEnoughAllowances) {
      setActiveStep(2);
    } else {
      approveTokenAndProceed();
    }
  };

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

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, recipientInfo.length - page * rowsPerPage);

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
              {recipientInfo
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(({ address, amount }) => (
                  <StyledTableRow key={address}>
                    <StyledTableCell>{address}</StyledTableCell>
                    <StyledTableCell>{amount}</StyledTableCell>
                  </StyledTableRow>
                ))}
              {!!emptyRows &&
                page > 0 &&
                [...Array(emptyRows).keys()].map((item) => (
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
          <CustomButton onClick={() => setActiveStep(0)}>Back</CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={tokenInfo?.notEnoughBalance}
          >
            {isEnoughAllowances ? "Next" : "Approve"}
          </CustomButton>
        </Box>
      </div>
    </Box>
  );
}

export default RecipientInfo;
