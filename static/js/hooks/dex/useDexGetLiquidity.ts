import { useEffect, useState } from 'react';
import useDex from '../classes/useDex';
import useRefresh from '../common/useRefresh';
import useBasedFinance from '../classes/useBasedFinance';
import { DexLiquidityInfo, DexTokenInfo } from '../../based-finance/types';

const useDexGetLiquidity = (token0: DexTokenInfo, token1: DexTokenInfo, amount: string,
                            slippage: number, isMainTokenChanged: boolean, isSelected: boolean) => {
  const [stat, setStat] = useState<DexLiquidityInfo>();
  const dex = useDex();
  const basedFinance = useBasedFinance();
  const isUnlocked = basedFinance?.isUnlocked;
  const { slowRefresh } = useRefresh();

  useEffect(() => {
    if( !dex  || !token0 || !token1 || !isSelected  ){
      setStat(undefined);
      return;
    }

    async function getDexLiquidity() {
      try {
        setStat(await dex.getLiquidity(token0, token1, amount, slippage, isMainTokenChanged));
      } catch (err) {
        console.error(err);
      }
    }

    getDexLiquidity().then();
  }, [isUnlocked, dex, token0, token1,slippage, isMainTokenChanged, amount, setStat, slowRefresh, isSelected]);

  return stat;
};

export default useDexGetLiquidity;
