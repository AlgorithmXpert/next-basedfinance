import { useEffect, useState } from 'react';
import useDex from '../classes/useDex';
import useRefresh from '../common/useRefresh';
import useBasedFinance from '../classes/useBasedFinance';
import { DexTokenInfo } from '../../based-finance/types';

const useDexTokensInfo = (tokensLen: number) => {
  const [stat, setStat] = useState<DexTokenInfo[]>();
  const dex = useDex();
  const basedFinance = useBasedFinance();
  const isUnlocked = basedFinance?.isUnlocked;

  useEffect(() => {
    if( !dex  || !tokensLen ){
      setStat(undefined);
      return;
    }

    async function getDexTokensInfo() {
      try {
        setStat(await dex.getDexTokens());
      } catch (err) {
        console.error(err);
      }
    }

    getDexTokensInfo().then();
  }, [dex, setStat, tokensLen]);

  return stat;
};

export default useDexTokensInfo;
