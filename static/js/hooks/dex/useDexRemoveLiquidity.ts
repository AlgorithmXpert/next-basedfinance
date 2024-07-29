import { useCallback } from 'react';
import { DexTokenInfo } from '../../based-finance';
import { DexLiquidityInfo, DexSwapInfo } from '../../based-finance/types';
import useDex from '../classes/useDex';
import useHandleTransactionReceipt from '../common/useHandleTransactionReceipt';

const useDexRemoveLiquidity = (minRecieved: number, info: DexLiquidityInfo) => {
  const dex = useDex();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const remove = useCallback(
    () => {
      handleTransactionReceipt(
        dex.removeLiquidity(minRecieved, info),
        `Remove  ${info.token0.name}-${info.token1.name} ${minRecieved} lps.`,
      );
    },
    [dex, info, handleTransactionReceipt],
  );
  return { onRemove: remove };
};

export default useDexRemoveLiquidity;
