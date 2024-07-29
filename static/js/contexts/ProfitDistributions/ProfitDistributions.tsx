import React, { useCallback, useEffect, useState } from 'react';
import Context from './context';
import useBasedFinance from '../../hooks/classes/useBasedFinance';
import { ProfitDistributionInfo } from '../../based-finance';
import  { profitDistributionDefinitions } from '../../views/Parthenon/profitConfig';

const ProfitDistributions: React.FC = ({ children }) => {
    const [profitDistributions, setProfits] = useState<ProfitDistributionInfo[]>([]);
    const basedFinance = useBasedFinance();
    const isUnlocked = basedFinance?.isUnlocked;

    const fetchPools = useCallback(async () => {
        const profitDistributions: ProfitDistributionInfo[] = [];

        for (const profInfo of Object.values(profitDistributionDefinitions)) {
            if (profInfo.finished) {
                if (!basedFinance.isUnlocked) continue;
            }

            profitDistributions.push({
                ...profInfo,
            });
        }
        profitDistributions.sort((a, b) => (a.sort > b.sort ? 1 : -1));
        setProfits(profitDistributions);
    }, [basedFinance, setProfits]);

    useEffect(() => {
        if (basedFinance) {
            fetchPools().catch((err) => console.error(`Failed to fetch pools: ${err.stack}`));
        }
    }, [isUnlocked, basedFinance, fetchPools]);

    return <Context.Provider value={{ profitDistributions }}>{children}</Context.Provider>;
};

export default ProfitDistributions;
