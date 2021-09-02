import React, { useCallback, useEffect } from "react";

import { Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";

import Covac from "../../abis/Covac.json";
import covac_icon from "../../assets/covac_icon.png";
import {
  getBalanceStrWithDecimalsConsidered,
  numberWithCommas,
} from "../../utils";

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
}));

function WalletInfo({
  web3,
  account,
  networkId,
  covacBalanceStr,
  setCovacBalanceStr,
  connectWallet,
  isDesktop,
}) {
  const classes = useStyles();

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
  }, [account, connectWallet, isDesktop]);

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
  }, [account, connectWallet, covacBalanceStr]);

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
        <Box my={1}>{renderCovacBalance()}</Box>
      </>
    );
  }
}

export default WalletInfo;
