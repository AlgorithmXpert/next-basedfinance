import { useEffect, useState } from 'react';
import useDex from '../classes/useDex';
import useRefresh from '../common/useRefresh';
import useBasedFinance from '../classes/useBasedFinance';
import { DexLiquidityInfo, DexSwapInfo, DexTokenInfo } from '../../based-finance/types';

const useGetRemoveLiquidityInfo = (amount: number, info: DexLiquidityInfo) => {
  const [stat, setStat] = useState<DexLiquidityInfo>();
  const dex = useDex();
  const basedFinance = useBasedFinance();
  const isUnlocked = basedFinance?.isUnlocked;

  useEffect(() => {
    if( !dex || !isUnlocked || !info ){
      setStat(undefined);
      return;
    }

    async function getRemoveLiqInfo() {
      try {
        setStat(await dex.getRemoveLiquidityInfo(amount, info));
      } catch (err) {
        console.error(err);
      }
    }

    getRemoveLiqInfo().then();
  }, [isUnlocked, dex, info, amount, setStat]);

  return stat;
};

export default useGetRemoveLiquidityInfo;
