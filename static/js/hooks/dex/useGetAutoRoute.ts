import { useEffect, useState } from 'react';
import useDex from '../classes/useDex';
import useRefresh from '../common/useRefresh';
import useBasedFinance from '../classes/useBasedFinance';
import { DexTokenInfo } from '../../based-finance/types';

const useGetAutoRoute = (token0: DexTokenInfo, token1: DexTokenInfo, amount: number) => {
  const [stat, setStat] = useState<DexTokenInfo[]>();
  const dex = useDex();
  const basedFinance = useBasedFinance();
  const isUnlocked = basedFinance?.isUnlocked;

  useEffect(() => {
    if( !dex  ){
      setStat(undefined);
      return;
    }

    async function getDexTokensInfo() {
      try {
        setStat(await dex.getAutoRoute(token0, token1, amount));
      } catch (err) {
        console.error(err);
      }
    }

    getDexTokensInfo().then();
  }, [isUnlocked, dex, token0, token1, setStat]);

  return stat;
};

export default useGetAutoRoute;
