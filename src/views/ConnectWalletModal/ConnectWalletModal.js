import React from "react";

import { Typography, useMediaQuery } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";

import Button from "../../components/Button";
import { Dialog, DialogTitle } from "../../components/Dialog";
import { wallet } from "../../walletConfigs";

const useStyles = makeStyles(() => ({
  walletOptionContainer: {
    width: 140,
    height: 140,
    margin: "0 16px",
    cursor: "pointer",
  },
  walletOptionContainerMobile: {
    width: 100,
    height: 100,
    margin: 0,
    padding: 0,
  },
  walletImageWrapper: {
    width: 100,
    height: 100,
  },
  walletImageWrapperMobile: {
    width: 60,
    height: 60,
  },
}));

const wallets = Object.values(wallet);

function ConnectWalletModal({ isVisible, setIsVisible, connectWallet }) {
  const classes = useStyles();
  const isMobile = useMediaQuery("(max-width: 440px)");

  const closeConnectWalletModal = () => setIsVisible(false);

  if (!isVisible) {
    return null;
  }

  const closeModalAndConnectWallet = (connector) => {
    closeConnectWalletModal();
    connectWallet(connector);
  };

  return (
    <Dialog onClose={closeConnectWalletModal} open={isVisible} maxWidth="md">
      <DialogTitle onClose={closeConnectWalletModal}>
        Connect Wallet
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="row" mb={3}>
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              className={clsx(classes.walletOptionContainer, {
                [classes.walletOptionContainerMobile]: isMobile,
              })}
              onClick={() => closeModalAndConnectWallet(wallet.key)}
            >
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box
                  display="flex"
                  justifyContents="center"
                  className={clsx(classes.walletImageWrapper, {
                    [classes.walletImageWrapperMobile]: isMobile,
                  })}
                >
                  <img
                    src={wallet.image}
                    width={isMobile ? 60 : 100}
                    alt={`${wallet.name} logo`}
                  />
                </Box>
                <Typography style={{ color: "#00636C" }}>
                  {wallet.name}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ConnectWalletModal;
