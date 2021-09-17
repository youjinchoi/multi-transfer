import React, { useCallback, useState } from "react";

import { useMediaQuery } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import { ExpandMore, ExpandLess } from "@material-ui/icons";
import clsx from "clsx";
import { Link } from "react-router-dom";

import covac_log_white from "../../assets/covac_logo_white.png";
import usePageType, { PAGE_TYPE } from "../../hooks/usePageType";
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
  covacLogo: {
    marginRight: 8,
    marginTop: 4,
  },
  link: {
    color: "#fff",
    fontSize: 18,
    margin: "0 8px",
    textDecoration: "none",
    textTransform: "none",
  },
  linkSelected: {
    marginTop: 4,
    borderBottom: "4px solid",
  },
}));

function Header({ openConnectWalletModal, openWalletActionModal }) {
  const classes = useStyles();
  const showLinks = useMediaQuery("(min-width: 1300px)");
  const showWalletInfo = useMediaQuery("(min-width: 1020px)");
  const [isWalletInfoMobileExpanded, setIsWalletInfoMobileExpanded] =
    useState(true);

  const pageType = usePageType();

  const toggleWalletInfoMobile = () =>
    setIsWalletInfoMobileExpanded(!isWalletInfoMobileExpanded);

  const renderWalletInfo = useCallback(
    () => (
      <WalletInfo
        isDesktop={showWalletInfo}
        openConnectWalletModal={openConnectWalletModal}
        openWalletActionModal={openWalletActionModal}
      />
    ),
    [showWalletInfo, openConnectWalletModal, openWalletActionModal]
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
        <Box display="flex" alignItems="center">
          <a
            href="https://covac.io"
            target="_blank"
            rel="noreferrer"
            className={classes.covacLogo}
          >
            <img src={covac_log_white} height={30} alt="covac logo" />
          </a>
          <Button>
            <Link
              to="/"
              className={clsx(classes.link, {
                [classes.linkSelected]: pageType === PAGE_TYPE.tokenblast,
              })}
            >
              TokenBlast
            </Link>
          </Button>
          <Button>
            <Link
              to="/how-to-use"
              className={clsx(classes.link, {
                [classes.linkSelected]: pageType === PAGE_TYPE.howToUse,
              })}
            >
              How to Use
            </Link>
          </Button>
        </Box>
        <Box
          display="flex"
          flexDirection={!showWalletInfo ? "column" : "row"}
          alignItems="center"
          my={showWalletInfo && 3}
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
