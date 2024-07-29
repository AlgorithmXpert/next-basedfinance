import { useEffect, useState } from 'react';
import useDex from '../classes/useDex';
import useRefresh from '../common/useRefresh';
import useBasedFinance from '../classes/useBasedFinance';
import { DexSwapInfo, DexTokenInfo } from '../../based-finance/types';

const useGetSwapInfo = (token0: DexTokenInfo, token1: DexTokenInfo, amount: string, slippage: number, isMainTokenChanged: boolean, isSelected: boolean) => {
  const [stat, setStat] = useState<DexSwapInfo>();
  const dex = useDex();
  const basedFinance = useBasedFinance();
  const isUnlocked = basedFinance?.isUnlocked;
  const { fastRefresh } = useRefresh();

  useEffect(() => {
    if( !dex  || !token0 || !token1 || !isSelected  ){
      setStat(undefined);
      return;
    }

    async function getDexTokensInfo() {
      try {
        setStat(await dex.getSwapInfo(token0, token1, amount, slippage, isMainTokenChanged));
      } catch (err) {
        console.error(err);
      }
    }

    getDexTokensInfo().then();
  }, [isUnlocked, dex, token0, token1,slippage, isMainTokenChanged, amount, setStat, fastRefresh, isSelected]);
  //[slippage, amount,isMainTokenChanged, setStat, fastRefresh]);
  return stat;
};

export default useGetSwapInfo;
