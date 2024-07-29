import { useCallback, useEffect, useState } from 'react';
import useBasedFinance from '../classes/useBasedFinance';
import config from '../../config';
import useDex from '../classes/useDex';

const useTokenBalance = (token: string) => {
  const [balance, setBalance] = useState(0);
  const basedFinance = useBasedFinance();
  const isUnlocked = basedFinance?.isUnlocked;
  const dex = useDex();

  const fetchBalance = useCallback(async () => {
    const balance = await dex.getTokenBalance(token);
    setBalance(balance);
  }, [token, basedFinance.myAccount]);

  useEffect(() => {

    if(!basedFinance && !dex && !token && !isUnlocked)
      return

    if (isUnlocked && dex ) {
      fetchBalance().catch((err) => console.error(`Failed to fetch token balance: ${err.stack}`));
      let refreshInterval = setInterval(fetchBalance, config.refreshInterval/2);
      return () => clearInterval(refreshInterval);
    }
    return;
  }, [ token, dex, isUnlocked]);

  return balance;
};

export default useTokenBalance;
