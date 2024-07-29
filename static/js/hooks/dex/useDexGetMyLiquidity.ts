import { useEffect, useState } from 'react';
import useDex from '../classes/useDex';
import useRefresh from '../common/useRefresh';
import useBasedFinance from '../classes/useBasedFinance';
import {
    DexMyLiquidityInfo
} from '../../based-finance/types';

const useGetMyLiquidityInfo = (isLoading: boolean, updateTrigger: number) => {
    const [stat, setStat] = useState<DexMyLiquidityInfo>();
    const dex = useDex();
    const basedFinance = useBasedFinance();
    const isUnlocked = basedFinance?.isUnlocked;
    const { slowRefresh } = useRefresh();

    useEffect(() => {
        if( !dex || !isUnlocked || isLoading ){
            setStat(undefined);
            return;
        }

        async function getMyLiquidity() {
            try {
                setStat(await dex.getMyLiquidityInfo());
            } catch (err) {
                console.error(err);
            }
        }

        getMyLiquidity().then();
    }, [isUnlocked, dex, setStat, updateTrigger,slowRefresh]);

    return stat;
};

export default useGetMyLiquidityInfo;
