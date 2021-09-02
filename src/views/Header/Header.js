import React, { useState, useEffect, useCallback } from "react";

import { Typography, useMediaQuery } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import { ExpandMore, ExpandLess } from "@material-ui/icons";
import clsx from "clsx";

import Covac from "../../abis/Covac.json";
import covac_icon from "../../assets/covac_icon.png";
import covac_log_white from "../../assets/covac_logo_white.png";
import {
  getBalanceStrWithDecimalsConsidered,
  numberWithCommas,
} from "../../utils";
import Links from "./Links";

const useStyles = makeStyles(() => ({
  fullWidth: {
    width: "100%",
  },
  header: {
    backgroundColor: "transparent",
    height: 120,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    padding: 40,
    boxShadow: "none",
    borderBottom: "2px solid #C1F4F7",
  },
  headerMobile: {
    backgroundColor: "transparent",
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
    padding: "12px 20px",
    boxShadow: "none",
    borderBottom: "2px solid #C1F4F7",
  },
  headerLink: {
    height: 40,
    marginLeft: 4,
    marginRight: 4,
  },
  icon: {
    color: "#fff",
  },
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
  linkImage: {
    width: 40,
    height: 40,
  },
}));

function Header({
  web3,
  account,
  networkId,
  connectWallet,
  covacBalanceStr,
  setCovacBalanceStr,
}) {
  const classes = useStyles();
  const showLinks = useMediaQuery("(min-width: 1000px)");
  const showWalletInfo = useMediaQuery("(min-width: 860px)");
  const [isWalletInfoMobileExpanded, setIsWalletInfoMobileExpanded] =
    useState(false);

  useEffect(() => {
    const getCovacBalance = async () => {
      const covacAddress = Covac.addresses[networkId];
      const covacContract = new web3.eth.Contract(Covac.abi, covacAddress);
      const balance = account
        ? await covacContract.methods.balanceOf(account).call()
        : null;
      const decimals = await covacContract.methods.decimals().call();
      const adjustedBalance = getBalanceStrWithDecimalsConsidered(
        balance,
        decimals
      );
      setCovacBalanceStr(adjustedBalance);
    };
    if (account && web3 && networkId) {
      getCovacBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, web3, networkId]);

  const toggleWalletInfoMobile = () =>
    setIsWalletInfoMobileExpanded(!isWalletInfoMobileExpanded);

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
          onClick={connectWallet}
        >
          {showWalletInfo && (
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
  }, [account, showWalletInfo]);

  const renderCovacBalance = useCallback(() => {
    if (!account || !covacBalanceStr) {
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
          className={clsx(classes.headerButton, classes.covacBalance)}
          onClick={connectWallet}
        >
          {numberWithCommas(covacBalanceStr)}
        </Button>
      </Box>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, covacBalanceStr]);

  return (
    <AppBar
      position="static"
      className={!showWalletInfo ? classes.headerMobile : classes.header}
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        className={classes.fullWidth}
      >
        <a href="https://covac.io" target="_blank" rel="noreferrer">
          <img src={covac_log_white} height={30} alt="covac logo" />
        </a>
        <Box
          display="flex"
          flexDirection={!showWalletInfo ? "column" : "row"}
          alignItems="center"
          my={showWalletInfo && 3}
          ml={3}
        >
          {showLinks && <Links />}
          {!showWalletInfo && (
            <IconButton
              onClick={toggleWalletInfoMobile}
              className={classes.icon}
            >
              {isWalletInfoMobileExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
          {showWalletInfo && (
            <>
              <Box mb={account ? 3 : 0} mx={2}>
                {renderWalletAccount()}
              </Box>
              <Box mb={account ? 3 : 0}>{renderCovacBalance()}</Box>
            </>
          )}
        </Box>
      </Box>
      {!showWalletInfo && isWalletInfoMobileExpanded && (
        <>
          <Box my={1}>{renderWalletAccount()}</Box>
          <Box my={1}>{renderCovacBalance()}</Box>
        </>
      )}
    </AppBar>
  );
}

export default Header;
