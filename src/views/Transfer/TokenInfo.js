import React, { useEffect, useState } from "react";

import {
  Box,
  CircularProgress,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import InputAdornment from "@material-ui/core/InputAdornment";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import { useWeb3React } from "@web3-react/core";
import Web3Utils from "web3-utils";

import { getContractABI } from "../../apis/bscscan";
import search from "../../assets/search.svg";
import Button from "../../components/Button";
import { Dialog, DialogTitle } from "../../components/Dialog";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import TextField from "../../components/TextField";
import { minimumCovacAmount } from "../../configs";
import useCovacBalance from "../../hooks/useCovacBalance";
import {
  getBalanceStrWithDecimalsConsidered,
  getContract,
  numberWithCommas,
} from "../../utils";

const useStyles = makeStyles((theme) => ({
  label: {
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 8,
  },
  tokenInfoGrid: {
    display: "flex",
    flexDirection: "column",
    width: 190,
  },
  tokenInfoDescription: {
    display: "flex",
    justifyContent: "flex-start",
  },
  tokenAddress: {
    background: "#F9FAFB",
    border: "0.6px solid #E5E7EB",
    borderRadius: 15,
  },
  button: {
    background: "#EC008C",
  },
  loading: {
    color: "#FFFFFF",
  },
  inputAlignCenter: {
    width: "100%",
    "& input": {
      textAlign: "center",
    },
  },
  tooltip: {
    fontSize: 12,
  },
  searchIconError: {
    filter:
      "invert(8%) sepia(97%) saturate(7218%) hue-rotate(349deg) brightness(79%) contrast(104%)",
  },
  buyOnHotbitButton: {
    marginLeft: 8,
  },
}));

const useStylesInput = makeStyles((theme) => ({
  root: {
    padding: 10,
    height: 50,
    border: "0.6px solid #E5E7EB",
    borderRadius: 15,
    background: "#F9FAFB",
  },
  input: {
    "&::placeholder": {
      color: "#00636C",
      opacity: 1,
    },
  },
  disabled: {
    color: "#00636C",
  },
}));

function TokenInfo({
  connectWallet,
  activeStep,
  tokenInfo,
  setTokenInfo,
  totalAmountWithDecimalsBN,
  showBuyCovacMessage,
  setShowBuyCovacMessage,
}) {
  const classes = useStyles();
  const inputClasses = useStylesInput();
  const [isLoading, setIsLoading] = useState(false);
  const [showConnectWalletMessage, setShowConnectWalletMessage] =
    useState(false);

  const isTokenInfoGrid = useMediaQuery("(min-width: 620px)");

  const { account, library, chainId } = useWeb3React();
  const { hasEnoughAmount: hasEnoughAmountOfCovac } = useCovacBalance();

  const onTokenAddressClick = () => {
    if (!account) {
      setShowConnectWalletMessage(true);
      return;
    }
    if (!hasEnoughAmountOfCovac) {
      setShowBuyCovacMessage(true);
      return;
    }
  };

  const hideConnectWalletMessage = () => setShowConnectWalletMessage(false);

  const getTokenBalance = async (contract) => {
    const decimals = await contract.decimals();
    const balanceBN = account ? await contract.balanceOf(account) : null;
    let adjustedBalance = null;
    let balance = balanceBN.toString();
    if (balance) {
      adjustedBalance = getBalanceStrWithDecimalsConsidered(balance, decimals);
    }
    return { adjustedBalance, balanceBN };
  };

  useEffect(() => {
    if (account && tokenInfo?.address && tokenInfo?.contract) {
      const updateTokenBalance = async () => {
        const { adjustedBalance, balanceBN } = await getTokenBalance(
          tokenInfo.contract
        );
        console.log(adjustedBalance, balanceBN, tokenInfo);
        setTokenInfo({ ...tokenInfo, balance: adjustedBalance, balanceBN });
      };
      updateTokenBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const onTokenAddressChange = async (e) => {
    const value = e?.target?.value;
    if (!value || !value.trim()) {
      setTokenInfo(null);
      return;
    }
    if (!Web3Utils.isAddress(value)) {
      setTokenInfo({
        isValid: false,
        errorMessage: "Invalid token address. please check again",
      });
      return;
    }
    setIsLoading(true);
    if (!tokenInfo?.isValid) {
      setTokenInfo({ isValid: true, errorMessage: null });
    }
    const abi = await getContractABI(value, chainId);
    if (!abi) {
      setTokenInfo({
        isValid: false,
        errorMessage: "Invalid token address. please check again",
      });
      setIsLoading(false);
      return;
    }

    const contract = getContract(value, abi, library, account);
    const decimals = await contract.decimals();
    const name = await contract.name();
    const symbol = await contract.symbol();
    const { adjustedBalance, balanceBN } = await getTokenBalance(contract);
    setTokenInfo({
      contract,
      address: value,
      name,
      symbol,
      decimals,
      balance: adjustedBalance,
      balanceBN,
      isValid: true,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    if (!tokenInfo?.balanceBN || !totalAmountWithDecimalsBN) {
      setTokenInfo({ ...tokenInfo, notEnoughBalance: false });
      return;
    }
    if (tokenInfo?.balanceBN.lte(totalAmountWithDecimalsBN)) {
      setTokenInfo({ ...tokenInfo, notEnoughBalance: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenInfo?.balanceBN, totalAmountWithDecimalsBN]);

  const onClickConnectWallet = () => {
    connectWallet();
    hideConnectWalletMessage();
  };

  const hideBuyCovacMessage = () => setShowBuyCovacMessage(false);

  return (
    <Box>
      <Box display="flex" justifyContent="center" m={1} flexDirection="column">
        <Box display="flex" justifyContent="flex-start">
          <Typography className={classes.label}>Token Address</Typography>
        </Box>
        <TextField
          onClick={onTokenAddressClick}
          onChange={onTokenAddressChange}
          disabled={!account || !hasEnoughAmountOfCovac || activeStep !== 0}
          InputProps={{
            classes: inputClasses,
            startAdornment: (
              <InputAdornment position="start">
                <img
                  src={search}
                  width={30}
                  height={30}
                  alt="search icon"
                  className={
                    tokenInfo?.isValid === false ? classes.searchIconError : ""
                  }
                />
              </InputAdornment>
            ),
            disableUnderline: true,
            placeholder: "Input your Token Address",
          }}
          error={tokenInfo?.isValid === false}
          helperText={
            tokenInfo?.isValid === false ? (
              <ErrorMessage text={tokenInfo?.errorMessage} />
            ) : null
          }
        />
        {showConnectWalletMessage && (
          <Dialog
            onClose={hideConnectWalletMessage}
            open={showConnectWalletMessage}
            maxWidth="md"
          >
            <DialogTitle onClose={hideConnectWalletMessage}>
              Wallet is not connected
            </DialogTitle>
            <DialogContent>
              <Typography>Please connect your wallet to proceed</Typography>
            </DialogContent>
            <DialogActions>
              <Box m={2}>
                <Button
                  autoFocus
                  onClick={onClickConnectWallet}
                  variant="contained"
                  color="primary"
                >
                  Connect
                </Button>
              </Box>
            </DialogActions>
          </Dialog>
        )}
        {showBuyCovacMessage && (
          <Dialog
            onClose={hideBuyCovacMessage}
            open={showBuyCovacMessage}
            maxWidth="md"
          >
            <DialogTitle onClose={hideBuyCovacMessage}>
              Insufficient $COVAC balance
            </DialogTitle>
            <DialogContent>
              <Typography>
                Minimum {numberWithCommas(minimumCovacAmount)} $COVAC in your
                wallet is required to proceed
              </Typography>
            </DialogContent>
            <DialogActions>
              <Box m={2} mt={4}>
                <Tooltip
                  title="$COVAC amount is auto-calculated considering 10% tax"
                  placement="top-end"
                  open={true}
                  arrow
                  classes={{ tooltip: classes.tooltip }}
                >
                  <Button
                    href="https://pancakeswap.finance/swap?inputCurrency=BNB&outputCurrency=0x2ADfe76173F7e7DAef1463A83BA4d06171fAc454&exactAmount=1111112&exactField=outPUT"
                    target="_blank"
                    onClick={hideBuyCovacMessage}
                    variant="contained"
                    color="primary"
                  >
                    Buy On Pancakeswap
                  </Button>
                </Tooltip>
                <Button
                  href="https://www.hotbit.io/exchange?symbol=COVAC_USDT"
                  target="_blank"
                  onClick={hideBuyCovacMessage}
                  variant="contained"
                  className={classes.buyOnHotbitButton}
                >
                  Buy On Hotbit
                </Button>
              </Box>
            </DialogActions>
          </Dialog>
        )}
      </Box>
      {isLoading && (
        <Box m={1} mt={2} display="flex" justifyContent="center">
          <CircularProgress className={classes.loading} />
        </Box>
      )}
      {!isLoading && !!tokenInfo && tokenInfo.isValid && (
        <>
          <Box
            display={isTokenInfoGrid ? "flex" : "block"}
            justifyContent="space-between"
            p={1}
          >
            <div className={isTokenInfoGrid && classes.tokenInfoGrid}>
              <div className={classes.tokenInfoDescription}>
                <Typography className={classes.label}>Name</Typography>
              </div>
              <TextField
                value={tokenInfo.name}
                disabled
                m={1}
                className={classes.inputAlignCenter}
              />
            </div>
            <div className={isTokenInfoGrid && classes.tokenInfoGrid}>
              <div className={classes.tokenInfoDescription}>
                <Typography className={classes.label}>Symbol</Typography>
              </div>
              <TextField
                value={tokenInfo.symbol}
                disabled
                m={1}
                className={classes.inputAlignCenter}
              />
            </div>
            <div className={isTokenInfoGrid && classes.tokenInfoGrid}>
              <div className={classes.tokenInfoDescription}>
                <Typography className={classes.label}>Decimals</Typography>
              </div>
              <TextField
                value={tokenInfo.decimals}
                disabled
                m={1}
                className={classes.inputAlignCenter}
              />
            </div>
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            flexDirection="column"
            m={1}
          >
            <Box display="flex" justifyContent="flex-start">
              <Typography className={classes.label}>
                Token Balance of Connected Wallet
              </Typography>
            </Box>
            <TextField
              value={numberWithCommas(tokenInfo.balance)}
              disabled
              error={activeStep === 1 && tokenInfo?.notEnoughBalance}
              helperText={
                activeStep === 1 && tokenInfo?.notEnoughBalance ? (
                  <ErrorMessage text="token balance is less than total amount to transfer" />
                ) : null
              }
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default TokenInfo;
