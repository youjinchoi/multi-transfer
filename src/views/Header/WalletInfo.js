import React, { useCallback } from "react";

import { CircularProgress, Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import { useWeb3React } from "@web3-react/core";

import covac_icon from "../../assets/covac_icon.png";
import useCovacBalance from "../../hooks/useCovacBalance";
import { numberWithCommas } from "../../utils";

const useStyles = makeStyles(() => ({
  headerButton: {
    backgroundColor: "rgb(255, 255, 255, 0.2)",
    borderRadius: 20,
    textTransform: "unset",
    minWidth: 100,
    color: "#FFFFFF",
    boxShadow: "none",
    height: 40,
    "&:hover": {
      backgroundColor: "rgb(255, 255, 255, 0.2)",
    },
    "& span": {
      color: "rgb(255, 255, 255)",
    },
    "& img": {
      marginRight: 8,
    },
  },
  covacLogoInWalletAddress: {
    marginLeft: -10,
  },
  headerButtonCaption: {
    marginBottom: 6,
  },
  loading: {
    color: "#fff",
  },
}));

function WalletInfo({
  isDesktop,
  openConnectWalletModal,
  openWalletActionModal,
}) {
  const classes = useStyles();
  const { account } = useWeb3React();
  const { isLoading, roundedBalanceStr } = useCovacBalance();

  const renderWalletAccount = useCallback(() => {
    return (
      <Box display="flex" flexDirection="column">
        {account && (
          <Typography variant="caption" className={classes.headerButtonCaption}>
            Wallet address:
          </Typography>
        )}
        <Button
          variant="contained"
          size="small"
          disableRipple
          className={classes.headerButton}
          onClick={account ? openWalletActionModal : openConnectWalletModal}
        >
          {isDesktop && (
            <img
              src={covac_icon}
              alt="covac icon"
              className={classes.covacLogoInWalletAddress}
            />
          )}
          {account ? account : "Connect"}
        </Button>
      </Box>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, openConnectWalletModal, openWalletActionModal, isDesktop]);

  const renderCovacBalance = useCallback(() => {
    if (!account) {
      return null;
    }
    return (
      <Box display="flex" flexDirection="column">
        <Typography variant="caption" className={classes.headerButtonCaption}>
          Your $COVAC balance:
        </Typography>
        <Button
          variant="contained"
          size="small"
          disableRipple
          className={classes.headerButton}
          onClick={openWalletActionModal}
        >
          {isLoading ? (
            <CircularProgress size={20} className={classes.loading} />
          ) : (
            numberWithCommas(roundedBalanceStr)
          )}
        </Button>
      </Box>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, openWalletActionModal, isLoading, roundedBalanceStr]);

  if (isDesktop) {
    return (
      <>
        <Box mb={account ? 3 : 0} mx={2}>
          {renderWalletAccount()}
        </Box>
        <Box mb={account ? 3 : 0}>{renderCovacBalance()}</Box>
      </>
    );
  } else {
    return (
      <>
        <Box my={1}>{renderWalletAccount()}</Box>
        {account && <Box my={1}>{renderCovacBalance()}</Box>}
      </>
    );
  }
}

export default WalletInfo;
