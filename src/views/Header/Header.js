import React, { useCallback, useState } from "react";

import { useMediaQuery } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import { ExpandMore, ExpandLess } from "@material-ui/icons";

import covac_log_white from "../../assets/covac_logo_white.png";
import Links from "./Links";
import WalletInfo from "./WalletInfo";

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
  icon: {
    color: "#fff",
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

  const toggleWalletInfoMobile = () =>
    setIsWalletInfoMobileExpanded(!isWalletInfoMobileExpanded);

  const renderWalletInfo = useCallback(
    () => (
      <WalletInfo
        web3={web3}
        account={account}
        networkId={networkId}
        isDesktop={showWalletInfo}
        connectWallet={connectWallet}
        covacBalanceStr={covacBalanceStr}
        setCovacBalanceStr={setCovacBalanceStr}
      />
    ),
    [
      web3,
      account,
      networkId,
      showWalletInfo,
      connectWallet,
      covacBalanceStr,
      setCovacBalanceStr,
    ]
  );

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
          {showWalletInfo && renderWalletInfo()}
        </Box>
      </Box>
      {!showWalletInfo && isWalletInfoMobileExpanded && renderWalletInfo()}
    </AppBar>
  );
}

export default Header;
