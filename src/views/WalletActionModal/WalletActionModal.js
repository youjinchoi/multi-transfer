import React from "react";

import { Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/core/styles";
import { useWeb3React } from "@web3-react/core";

import Button from "../../components/Button";
import { Dialog, DialogTitle } from "../../components/Dialog";
import { numberWithCommas } from "../../utils";

const useStyles = makeStyles(() => ({
  walletOptionContainer: {
    width: 140,
    height: 140,
    margin: "0 16px",
    cursor: "pointer",
  },
  walletImageWrapper: {
    width: 100,
    height: 100,
  },
  actionButton: {
    margin: 8,
  },
  walletInfo: {
    textAlign: "center",
    color: "#00636C",
    fontSize: 18,
    background: "#F9FAFB",
    padding: "14px 20px",
    borderRadius: 15,
    border: "0.6px solid #E5E7EB",
    "& p": {
      margin: 0,
      textOverflow: "ellipsis",
      overflow: "hidden",
    },
  },
  walletInfoTextField: {
    "& input": {
      textAlign: "center",
    },
  },
}));

function WalletActionModal({
  isVisible,
  setIsVisible,
  covacBalanceStr,
  openConnectWalletModal,
  disconnectWallet: disconnectWalletProp,
}) {
  const classes = useStyles();
  const { account } = useWeb3React();

  const closeModal = () => setIsVisible(false);

  if (!isVisible) {
    return null;
  }

  const changeWallet = () => {
    closeModal();
    openConnectWalletModal();
  };

  const disconnectWallet = () => {
    closeModal();
    disconnectWalletProp();
  };

  return (
    <Dialog onClose={closeModal} open={isVisible}>
      <DialogTitle onClose={closeModal}>Your Wallet</DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          justifyContent="center"
          flexDirection="column"
          mb={3}
        >
          <Box display="flex" justifyContent="flex-start" mb={1}>
            <Typography className={classes.label}>Address</Typography>
          </Box>
          <Box className={classes.walletInfo}>
            <p>{account}</p>
          </Box>
        </Box>
        <Box display="flex" justifyContent="center" flexDirection="column">
          <Box display="flex" justifyContent="flex-start" mb={1}>
            <Typography className={classes.label}>$COVAC balance</Typography>
          </Box>
          <Box className={classes.walletInfo}>
            <p>{numberWithCommas(covacBalanceStr)}</p>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box m={1}>
          <Button
            variant="contained"
            onClick={changeWallet}
            className={classes.actionButton}
          >
            Change Wallet
          </Button>
          <Button
            variant="contained"
            onClick={disconnectWallet}
            className={classes.actionButton}
          >
            Disconnect
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default WalletActionModal;
