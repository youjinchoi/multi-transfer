import { useEffect, useState } from "react";

import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "ethers";

import Covac from "../abis/Covac.json";
import { minimumCovacAmount } from "../configs";
import { getBalanceStrWithDecimalsConsidered, getContract } from "../utils";

const minimumCovacAmountBN = BigNumber.from(minimumCovacAmount);

const useCovacBalance = () => {
  const { account, chainId, library } = useWeb3React();
  const [isLoading, setIsLoading] = useState(false);
  const [balanceBN, setBalanceBN] = useState(null);
  const [roundedBalanceStr, setRoundedBalanceStr] = useState(null);
  const [hasEnoughAmount, setHasEnoughAmount] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    if (!account || !chainId || !library) {
      setIsLoading(false);
      setBalanceBN(null);
      setRoundedBalanceStr(null);
      setHasEnoughAmount(false);
      return;
    }
    const getCovacBalance = async () => {
      const covacAddress = Covac.addresses[chainId];
      const covacContract = getContract(
        covacAddress,
        Covac.abi,
        library,
        account
      );
      if (!covacContract) {
        setIsLoading(false);
        setBalanceBN(null);
        setRoundedBalanceStr(null);
        setHasEnoughAmount(false);
      }
      const balanceBN = await covacContract.balanceOf(account);
      setBalanceBN(balanceBN);
      setHasEnoughAmount(balanceBN.gte(minimumCovacAmountBN));
      const decimals = await covacContract.decimals();
      const adjustedBalance = getBalanceStrWithDecimalsConsidered(
        balanceBN.toString(),
        decimals
      );
      setRoundedBalanceStr(adjustedBalance);
      setIsLoading(false);
    };
    if (account && chainId && library) {
      getCovacBalance();
    }
  }, [account, chainId, library]);

  return { isLoading, balanceBN, roundedBalanceStr, hasEnoughAmount };
};

export default useCovacBalance;
