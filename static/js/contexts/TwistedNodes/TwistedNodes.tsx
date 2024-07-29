import React, { useCallback, useEffect, useState } from 'react';
import Context from './context';
import useBasedFinance from '../../hooks/classes/useBasedFinance';
import { TwistedNodesInfo } from '../../based-finance';
import  { twistedNodes } from '../../views/TwistedNodes/nodesConfig';

const TwistedNodes: React.FC = ({ children }) => {
    const [twistedNodesInfo, setTwistedNodesInfo] = useState<TwistedNodesInfo[]>([]);
    const basedFinance = useBasedFinance();
    const isUnlocked = basedFinance?.isUnlocked;

    const fetchPools = useCallback(async () => {
        const twistedNodesInfo: TwistedNodesInfo[] = [];
        if (!basedFinance.isUnlocked) return;

        for (const profInfo of Object.values(twistedNodes)) {
            twistedNodesInfo.push({
                ...profInfo,
            });
        }
        setTwistedNodesInfo(twistedNodesInfo);
    }, [basedFinance, setTwistedNodesInfo]);

    useEffect(() => {
        if (basedFinance) {
            fetchPools().catch((err) => console.error(`Failed to fetch pools: ${err.stack}`));
        }
    }, [isUnlocked, basedFinance, fetchPools]);

    return <Context.Provider value={{ twistedNodesInfo }}>{children}</Context.Provider>;
};

export default TwistedNodes;
