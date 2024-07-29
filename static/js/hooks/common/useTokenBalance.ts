import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import ERC20 from '../../based-finance/ERC20';
import useBasedFinance from '../classes/useBasedFinance';
import config from '../../config';

const useTokenBalance = (token: any) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const basedFinance = useBasedFinance();
  const isUnlocked = basedFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    const balance = await token.balanceOf(basedFinance.myAccount);
    setBalance(balance);
  }, [token, basedFinance.myAccount]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(`Failed to fetch token balance: ${err.stack}`));
      let refreshInterval = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
  }, [isUnlocked, token, fetchBalance, basedFinance]);

  return balance;
};

export default useTokenBalance;
