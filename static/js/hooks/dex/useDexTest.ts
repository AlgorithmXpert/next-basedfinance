import { useEffect, useState, useCallback } from 'react';
import useDex from '../classes/useDex';
import useRefresh from '../common/useRefresh';
import useBasedFinance from '../classes/useBasedFinance';
import { DexTokenInfo } from '../../based-finance/types';

const useDexTest = () => {
  const [stat, setStat] = useState<number>();
  const dex = useDex();
  const basedFinance = useBasedFinance();
  const isUnlocked = basedFinance?.isUnlocked;
  
    const handleTest = useCallback(
      () => {
          dex.testFunc();
      },
      [dex],
    );
    return { onTest: handleTest };
  };
  
export default useDexTest;
