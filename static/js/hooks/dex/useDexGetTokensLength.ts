import { useEffect, useState, useCallback } from 'react';
import useDex from '../classes/useDex';
import useRefresh from '../common/useRefresh';
import useBasedFinance from '../classes/useBasedFinance';
import { DexTokenInfo } from '../../based-finance/types';

const useDexGetTokensLength = () => {
    const [stat, setStat] = useState<number>();
    const dex = useDex();
    const basedFinance = useBasedFinance();
    const isUnlocked = basedFinance?.isUnlocked;
  
    useEffect(() => {
      if( !dex || !isUnlocked ){
        setStat(undefined);
        return;
      }
  
      async function getDexTokensInfo() {
        try {
          setStat(await dex.getDexTokensLength());
        } catch (err) {
          console.error(err);
        }
      }
  
      getDexTokensInfo().then();
    }, [isUnlocked, dex, setStat]);
  
    return stat;
  };
  
export default useDexGetTokensLength;
