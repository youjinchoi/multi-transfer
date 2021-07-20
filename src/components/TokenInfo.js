import React, {useEffect, useState} from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import Web3Utils from "web3-utils";
import { getContractABI } from "../apis/bscscan";
import CustomTextField from "./CustomTextField";

function TokenInfo({ web3, account, activeStep, tokenInfo, setTokenInfo, totalAmountWithDecimalsBN }) {
  const [isLoading, setIsLoading] = useState(false);

  const onTokenAddressChange = async (e) => {
    const value = e?.target?.value;
    if (!value || !value.trim()) {
      setTokenInfo(null);
      return;
    }
    if (!Web3Utils.isAddress(value)) {
      setTokenInfo({ isValid: false, errorMessage: "Invalid token address. please check again" });
      return;
    }
    setIsLoading(true);
    const abi = await getContractABI(value);
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

  return (
    <Box>
      <Box display="flex" justifyContent="center" m={1}>
        <CustomTextField
          required
          error={tokenInfo?.isValid === false}
          helperText={tokenInfo?.errorMessage}
          label="Token Address"
          variant="outlined"
          onChange={onTokenAddressChange}
          disabled={activeStep !== 0}
          style={{ width: "612px" }}
        />
      </Box>
      {isLoading && (
        <Box m={1} mt={2}>
          <CircularProgress />
        </Box>
      )}
      {!!tokenInfo && tokenInfo.isValid && (
        <>
          <Box display="flex" justifyContent="center">
            <Box m={1}>
              <CustomTextField label="Name" variant="outlined" value={tokenInfo.name} disabled m={1} />
            </Box>
            <Box m={1}>
              <CustomTextField label="Symbol" variant="outlined" value={tokenInfo.symbol} disabled m={1} />
            </Box>
            <Box m={1}>
              <CustomTextField label="Decimals" variant="outlined" value={tokenInfo.decimals} disabled m={1} />
            </Box>
          </Box>
          <Box display="flex" justifyContent="center" m={1}>
            <CustomTextField
              label="Token Balance of Connected Wallet"
              variant="outlined"
              value={tokenInfo.balance}
              disabled
              error={tokenInfo?.notEnoughBalance}
              helperText={tokenInfo?.notEnoughBalance ? "token balance is less than total amount to transfer" : null}
              style={{ width: "612px" }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default TokenInfo;
