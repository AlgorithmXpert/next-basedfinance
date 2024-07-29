import { useCallback } from 'react';
import { DexTokenInfo } from '../../based-finance';
import useDex from '../classes/useDex';
import useHandleTransactionReceipt from '../common/useHandleTransactionReceipt';
import { BigNumber } from 'ethers';

const useDexAddLiquidity = (token0: DexTokenInfo, token1:DexTokenInfo,
     token0Amount: string, token1Amount: string, lp: number, slippage: number) => {
  const dex = useDex();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const addLiquidity = useCallback(
    () => {
      handleTransactionReceipt(
        dex.addLiquidity(token0, token1, token0Amount, token1Amount, lp, slippage),
        `Add liquidity ${token0.name}-${token1.name}-LP for ${lp.toFixed(4)} ${token0Amount}/${token1Amount} with slippage ${slippage}.`,
      );
    },
    [dex, lp, slippage, token0, token1, token0Amount, token1Amount, handleTransactionReceipt],
  );
  return { onAddLiquidity: addLiquidity };
};

export default useDexAddLiquidity;
