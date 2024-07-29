import React, { createContext, useEffect, useState } from 'react';
import {TwistedNodes} from "../../based-finance/TwistedNodes";
import useBasedFinance from "../../hooks/classes/useBasedFinance";

export interface TwistedNodesContext {
    twistedNodes?: TwistedNodes;
}

export const Context = createContext<TwistedNodesContext>({ twistedNodes: null });

export const TwistedNodesProvider: React.FC = ({  children }) => {
    const [twistedNodes, setTwistedNodes] = useState<TwistedNodes>();
    const basedFinance = useBasedFinance();

    useEffect(() => {
        if (!twistedNodes && basedFinance ) {
            const twistedNodes = new TwistedNodes(basedFinance);
            setTwistedNodes(twistedNodes);
        }
    }, [basedFinance, twistedNodes]);

    return <Context.Provider value={{ twistedNodes }}>{children}</Context.Provider>;
};