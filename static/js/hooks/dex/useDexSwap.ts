import { useCallback } from 'react';
import { DexTokenInfo } from '../../based-finance';
import { DexSwapInfo } from '../../based-finance/types';
import useDex from '../classes/useDex';
import useHandleTransactionReceipt from '../common/useHandleTransactionReceipt';

const useDexSwap = (swapInfo: DexSwapInfo, token0Amount: string) => {
  const dex = useDex();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const swap = useCallback(
    () => {
      handleTransactionReceipt(
        dex.dexSwap(swapInfo, token0Amount),
        `Swap ${swapInfo.token0.name} ${token0Amount} to ${swapInfo.token1.name} ${swapInfo.swapAmount}.`,
      );
    },
    [dex, swapInfo, handleTransactionReceipt],
  );
  return { onSwap: swap };
};

export default useDexSwap;
