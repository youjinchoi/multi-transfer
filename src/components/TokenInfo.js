import React, {useEffect, useState, useMemo} from 'react';
import {Box, CircularProgress, Typography} from '@material-ui/core';
import Web3Utils from "web3-utils";
import { getContractABI } from "../apis/bscscan";
import CustomTextField from "./CustomTextField";
import {makeStyles} from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import search from "../assets/search.png";
import ErrorMessage from "./ErrorMessage";
import {CustomDialog, CustomDialogTitle} from "./CustomDialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import CustomButton from "./CustomButton";

const useStyles = makeStyles((theme) => ({
  label: {
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 8,
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
    "& input": {
      textAlign: "center",
      width: 150,
    },
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
  'input': {
    '&::placeholder': {
      color: '#00636C',
      opacity: 1,
    }
  },
  disabled: {
    color: "#00636C",
  },
}));

function TokenInfo({ web3, account, networkId, covacBalanceStr, connectWallet, activeStep, tokenInfo, setTokenInfo, totalAmountWithDecimalsBN }) {
  const classes = useStyles();
  const inputClasses = useStylesInput();
  const [isLoading, setIsLoading] = useState(false);
  const [showConnectWalletMessage, setShowConnectWalletMessage] = useState(false);
  const [showBuyCovacMessage, setShowBuyCovacMessage] = useState(false);

  const isNotEnoughCovac = useMemo(() => Number(covacBalanceStr) < 1000000, [covacBalanceStr]);

  const onTokenAddressClick = () => {
    if (!account) {
      setShowConnectWalletMessage(true);
      return;
    }
    if (isNotEnoughCovac) {
      console.log("insufficient balance");
      setShowBuyCovacMessage(true);
      return;
    }
  }

  const hideConnectWalletMessage = () => setShowConnectWalletMessage(false);

  const onTokenAddressChange = async (e) => {
    const value = e?.target?.value;
    if (!value || !value.trim()) {
      setTokenInfo(null);
      return;
    }
    if (!Web3Utils.isAddress(value)) {
      console.log("here");
      setTokenInfo({ isValid: false, errorMessage: "Invalid token address. please check again" });
      return;
    }
    setIsLoading(true);
    if (!tokenInfo?.isValid) {
      setTokenInfo({ isValid: true, errorMessage: null });
    }
    const abi = await getContractABI(value, networkId);
    if (!abi) {
      setTokenInfo({ isValid: false, errorMessage: "Invalid token address. please check again" });
      setIsLoading(false);
      return;
    }
    const contract = new web3.eth.Contract(abi, value);
    const decimals = await contract.methods.decimals().call();
    const name = await contract.methods.name().call();
    const symbol = await contract.methods.symbol().call();
    const balance = account ? await contract.methods.balanceOf(account).call() : null;
    let adjustedBalance = null;
    let balanceBN = null;
    if (balance) {
      const decimalsBN = new web3.utils.BN(decimals);
      balanceBN = new web3.utils.BN(balance);
      const divisor = new web3.utils.BN(10).pow(decimalsBN);
      const beforeDecimal = balanceBN.div(divisor);
      const afterDecimal  = balanceBN.mod(divisor);
      adjustedBalance = `${beforeDecimal.toString()}.${afterDecimal.toString()}`;
    }
    setTokenInfo({ contract, address: value, name, symbol, decimals, balance: adjustedBalance, balanceBN, isValid: true });
    setIsLoading(false);
  };

  useEffect(() => {
    if (!tokenInfo?.balanceBN || !totalAmountWithDecimalsBN) {
      setTokenInfo({ ...tokenInfo, notEnoughBalance: false })
      return;
    }
    if (tokenInfo?.balanceBN.lte(totalAmountWithDecimalsBN)) {
      setTokenInfo({ ...tokenInfo, notEnoughBalance: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenInfo?.balanceBN, totalAmountWithDecimalsBN]);

  const onClickConnectWallet = () => {
    connectWallet();
    hideConnectWalletMessage();
  }

  const hideBuyCovacMessage = () => setShowBuyCovacMessage(false);

  const onClickBuyCovac = () => {
    window.open("https://pancakeswap.finance/swap?inputCurrency=BNB&outputCurrency=0x2ADfe76173F7e7DAef1463A83BA4d06171fAc454&exactAmount=1111112&exactField=outPUT");
    hideBuyCovacMessage();
  }

  return (
    <Box>
      <Box display="flex" justifyContent="center" m={1} flexDirection="column">
        <Box display="flex" justifyContent="flex-start">
          <Typography className={classes.label}>Token Address</Typography>
        </Box>
        <CustomTextField
          onClick={onTokenAddressClick}
          onChange={onTokenAddressChange}
          disabled={!account || isNotEnoughCovac || activeStep !== 0}
          InputProps={{
            classes: inputClasses,
            startAdornment: (
              <InputAdornment position="start">
                <img src={search} width={30} height={30} alt="search icon" />
              </InputAdornment>
            ),
            disableUnderline: true,
            placeholder: "Input your Token Address",
          }}
          error={tokenInfo?.isValid === false}
          helperText={tokenInfo?.isValid === false ? <ErrorMessage text={tokenInfo?.errorMessage} /> : null}
        />
        {showConnectWalletMessage && (
          <CustomDialog onClose={hideConnectWalletMessage} open={showConnectWalletMessage} maxWidth="md">
            <CustomDialogTitle onClose={hideConnectWalletMessage}>
              Metamask wallet is not connected
            </CustomDialogTitle>
            <DialogContent>
              <Typography>Please connect your Metamask wallet to proceed</Typography>
            </DialogContent>
            <DialogActions>
              <Box m={2}>
                <CustomButton autoFocus onClick={onClickConnectWallet} variant="contained" color="primary">
                  Connect
                </CustomButton>
              </Box>
            </DialogActions>
          </CustomDialog>
        )}
        {showBuyCovacMessage && (
          <CustomDialog onClose={hideBuyCovacMessage} open={showBuyCovacMessage} maxWidth="md">
            <CustomDialogTitle onClose={hideBuyCovacMessage}>
              Insufficient $COVAC balance
            </CustomDialogTitle>
            <DialogContent>
              <Typography>Minimun 1,000,000 $COVAC in your wallet is required to proceed</Typography>
            </DialogContent>
            <DialogActions>
              <Box m={2}>
                <CustomButton autoFocus onClick={onClickBuyCovac} variant="contained" color="primary">
                  Buy On Pancakeswap
                </CustomButton>
              </Box>
            </DialogActions>
          </CustomDialog>
        )}
      </Box>
      {isLoading && (
        <Box m={1} mt={2} display="flex" justifyContent="center">
          <CircularProgress className={classes.loading}/>
        </Box>
      )}
      {!isLoading && !!tokenInfo && tokenInfo.isValid && (
        <>
          <Box display="flex" justifyContent="space-between" p={1}>
            <Box>
              <Box display="flex" justifyContent="flex-start">
                <Typography className={classes.label}>Name</Typography>
              </Box>
              <CustomTextField value={tokenInfo.name} disabled m={1} className={classes.inputAlignCenter} />
            </Box>
            <Box>
              <Box display="flex" justifyContent="flex-start">
                <Typography className={classes.label}>Symbol</Typography>
              </Box>
              <CustomTextField value={tokenInfo.symbol} disabled m={1} className={classes.inputAlignCenter} />
            </Box>
            <Box>
              <Box display="flex" justifyContent="flex-start">
                <Typography className={classes.label}>Decimals</Typography>
              </Box>
              <CustomTextField value={tokenInfo.decimals} disabled m={1} className={classes.inputAlignCenter} />
            </Box>
          </Box>
          <Box display="flex" justifyContent="center" flexDirection="column" m={1}>
            <Box display="flex" justifyContent="flex-start">
              <Typography className={classes.label}>Token Balance of Connected Wallet</Typography>
            </Box>
            <CustomTextField
              value={tokenInfo.balance}
              disabled
              error={activeStep === 1 && tokenInfo?.notEnoughBalance}
              helperText={activeStep === 1 && tokenInfo?.notEnoughBalance ? <ErrorMessage text="token balance is less than total amount to transfer" /> : null}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default TokenInfo;
