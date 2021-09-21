import React, { useCallback, useEffect, useState, memo } from "react";

import {
  Box,
  CircularProgress,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "bignumber.js";
import clsx from "clsx";
import Web3Utils from "web3-utils";

import { getContractABI } from "../../apis/bscscan";
import { getTokens } from "../../apis/tokens";
import Button from "../../components/Button";
import { Dialog, DialogTitle } from "../../components/Dialog";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Search from "../../components/Svgs/Search";
import TextField from "../../components/TextField";
import { minimumCovacAmount } from "../../configs";
import useCovacBalance from "../../hooks/useCovacBalance";
import {
  getBalanceStrWithDecimalsConsidered,
  getContract,
  numberWithCommas,
} from "../../utils";

const useStyles = makeStyles(() => ({
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
    "& label": {
      top: 10,
      left: 20,
      color: "#00636C",
      zIndex: 99,
      fontSize: 18,
      transform: "none",
    },
    "& label.Mui-disabled svg": {
      color: "inherit",
    },
    "& label.Mui-focused": {
      display: "none",
    },
    "& label.MuiFormLabel-filled": {
      display: "none",
    },
    "& div.MuiInput-root": {
      marginTop: 0,
    },
    "& input": {
      padding: "0 !important",
    },
    "& .MuiAutocomplete-endAdornment": {
      marginRight: 8,
    },
  },
  tokenAddressIcon: {
    marginRight: 8,
    color: "inherit",
  },
  tokenAddressSearchOption: {
    color: "#00636C",
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

const Option = memo(({ className, option }) => (
  <Box
    display="flex"
    flexDirection="row"
    alignItems="center"
    className={className}
  >
    <Box mr={2}>{option.symbol}</Box>
    {option.address}
  </Box>
));

const filterOptions = (options, state) => {
  const { inputValue } = state;
  const inputValueLowerCase = inputValue?.toLowerCase();
  return options.filter(
    (option) =>
      option?.symbol?.toLowerCase().indexOf(inputValueLowerCase) > -1 ||
      option?.address?.toLowerCase().indexOf(inputValueLowerCase) > -1
  );
};

const getTokenBalance = async (contract, account) => {
  const decimals = await contract.decimals();
  const balance = account ? await contract.balanceOf(account) : null;
  let balanceBN = null;
  let adjustedBalance = null;
  if (balance) {
    balanceBN = new BigNumber(balance.toString());
    adjustedBalance = getBalanceStrWithDecimalsConsidered(
      balance.toString(),
      decimals
    );
  }
  return { adjustedBalance, balanceBN };
};

function TokenInfo({
  openConnectWalletModal,
  tokenAddressInputRef,
  activeStep,
  tokenInfo,
  setTokenInfo,
  totalAmountWithDecimalsBN,
  showBuyCovacMessage,
  setShowBuyCovacMessage,
}) {
  const classes = useStyles();
  const [isLoadingTokenList, setIsLoadingTokenList] = useState(false);
  const [isLoadingTokenContract, setIsLoadingTokenContract] = useState(false);
  const [isNormalInput, setIsNormalInput] = useState(false);
  const [showConnectWalletMessage, setShowConnectWalletMessage] =
    useState(false);
  const [tokens, setTokens] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const isTokenInfoGrid = useMediaQuery("(min-width: 620px)");

  const { account, library, chainId } = useWeb3React();
  const { hasEnoughAmount: hasEnoughAmountOfCovac } = useCovacBalance();

  const hideConnectWalletMessage = () => setShowConnectWalletMessage(false);

  useEffect(() => {
    if (account && chainId) {
      setIsLoadingTokenList(true);
      getTokens(chainId, account)
        .then((response) => {
          setTokens(response?.data);
        })
        .catch((e) => {
          console.error(e);
          setIsNormalInput(true);
        })
        .finally(() => setIsLoadingTokenList(false));
    }

    if (account && tokenInfo?.address && tokenInfo?.contract) {
      const updateTokenBalance = async () => {
        const { adjustedBalance, balanceBN } = await getTokenBalance(
          tokenInfo.contract,
          account
        );
        setTokenInfo({ ...tokenInfo, balance: adjustedBalance, balanceBN });
      };
      updateTokenBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  useEffect(() => {
    if (!tokenInfo?.balanceBN || !totalAmountWithDecimalsBN) {
      setTokenInfo({ ...tokenInfo, notEnoughBalance: false });
      return;
    }
    if (tokenInfo?.balanceBN.lt(totalAmountWithDecimalsBN)) {
      setTokenInfo({ ...tokenInfo, notEnoughBalance: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenInfo?.balanceBN, totalAmountWithDecimalsBN]);

  const onClickConnectWallet = () => {
    openConnectWalletModal();
    hideConnectWalletMessage();
  };

  const hideBuyCovacMessage = () => setShowBuyCovacMessage(false);

  const renderTokenAddressLabel = useCallback(
    () => (
      <Box display="flex" flexDirection="row" alignItems="center">
        {isLoadingTokenList ? (
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            ml={1}
            width={30}
            height={30}
          >
            <CircularProgress size={20} className={classes.tokenAddressIcon} />
          </Box>
        ) : (
          <Search
            width={30}
            height={30}
            className={clsx(classes.tokenAddressIcon, {
              [classes.searchIconError]: tokenInfo?.isValid === false,
            })}
          />
        )}
        {isNormalInput ? "Input your Token Address" : "Select your Token"}
      </Box>
    ),
    [classes, tokenInfo, isLoadingTokenList, isNormalInput]
  );

  const renderAutocomplete = useCallback(() => {
    const fetchTokenInfo = async (address, tokenOption) => {
      if (!tokenInfo?.isValid) {
        setTokenInfo({ isValid: true, errorMessage: null });
      }
      setIsLoadingTokenContract(true);
      const abi = await getContractABI(address, chainId);
      if (!abi) {
        setTokenInfo({
          isValid: false,
          errorMessage: "Failed to get token abi. Please check again",
        });
        setIsLoadingTokenContract(false);
        return;
      }
      const contract = getContract(address, abi, library, account);
      if (!contract.decimals || !contract.name || !contract.symbol) {
        setTokenInfo({
          isValid: false,
          errorMessage:
            "This token is not following BEP-20 standard. Please check again",
        });
        setIsLoadingTokenContract(false);
        return;
      }

      const decimals = await contract?.decimals();
      const name = await contract?.name();
      const symbol = await contract?.symbol();

      const { adjustedBalance, balanceBN } = await getTokenBalance(
        contract,
        account
      );
      setTokenInfo({
        contract,
        address,
        name,
        symbol,
        decimals,
        balance: adjustedBalance,
        balanceBN,
        isValid: true,
      });
      if (tokenOption) {
        setSelectedOption(tokenOption);
      }
      setIsLoadingTokenContract(false);
    };

    const onTokenAddressSelect = async (_, tokenOption) => {
      if (!tokenOption) {
        setTokenInfo(null);
        setSelectedOption(null);
        return;
      }

      await fetchTokenInfo(tokenOption?.address, tokenOption);
    };

    const onTokenAddressInputChange = async (_, value) => {
      if (!isNormalInput) {
        return;
      }
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
      if (value === tokenInfo?.address) {
        return;
      }
      await fetchTokenInfo(value);
    };

    const getHelperText = () => {
      if (tokenInfo?.isValid === false) {
        return <ErrorMessage text={tokenInfo?.errorMessage} />;
      } else if (isNormalInput && !tokenInfo?.address) {
        return (
          <ErrorMessage text="Failed to get token list. Please manually input token address" />
        );
      } else {
        return null;
      }
    };

    return (
      <Autocomplete
        freeSolo={isNormalInput}
        loading={isLoadingTokenList}
        value={isNormalInput ? tokenInfo?.address : selectedOption}
        options={tokens || []}
        filterOptions={filterOptions}
        getOptionLabel={(input) => (isNormalInput ? input : input.address)}
        onChange={onTokenAddressSelect}
        onInputChange={onTokenAddressInputChange}
        renderInput={(params) => {
          return (
            <TextField
              InputProps={{
                ...params?.InputProps,
                inputRef: tokenAddressInputRef,
              }}
              error={tokenInfo?.isValid === false}
              helperText={getHelperText()}
              label={renderTokenAddressLabel()}
              className={classes.tokenAddress}
              {...params}
            />
          );
        }}
        renderOption={(option) => (
          <Option
            option={option}
            className={classes.tokenAddressSearchOption}
          />
        )}
      />
    );
  }, [
    account,
    chainId,
    library,
    setTokenInfo,
    tokens,
    classes,
    renderTokenAddressLabel,
    tokenInfo,
    tokenAddressInputRef,
    selectedOption,
    isNormalInput,
    isLoadingTokenList,
  ]);

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

  return (
    <Box>
      <Box display="flex" justifyContent="center" m={1} flexDirection="column">
        <Box display="flex" justifyContent="flex-start">
          <Typography className={classes.label}>Token Address</Typography>
        </Box>
        {!account ||
        !hasEnoughAmountOfCovac ||
        (!tokens?.length && !isNormalInput) ||
        activeStep !== 0 ? (
          <TextField
            onClick={onTokenAddressClick}
            disabled={true}
            InputProps={{
              value: tokenInfo?.address ? tokenInfo.address : null,
            }}
            error={tokenInfo?.isValid === false}
            helperText={
              tokenInfo?.isValid === false ? (
                <ErrorMessage text={tokenInfo?.errorMessage} />
              ) : null
            }
            label={tokenInfo?.address ? null : renderTokenAddressLabel()}
            className={classes.tokenAddress}
          />
        ) : (
          renderAutocomplete()
        )}
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
                  onClick={onClickConnectWallet}
                  variant="contained"
                  color="primary"
                >
                  Connect Wallet
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
      {isLoadingTokenContract && (
        <Box m={1} mt={2} display="flex" justifyContent="center">
          <CircularProgress className={classes.loading} />
        </Box>
      )}
      {!isLoadingTokenContract && !!tokenInfo && tokenInfo.isValid && (
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
