import React, { createContext, useEffect, useState } from 'react';
import {Dex} from "../../based-finance/Dex";
import useBasedFinance from "../../hooks/classes/useBasedFinance";

export interface DexContext {
    dex?: Dex;
}

export const Context = createContext<DexContext>({ dex: null });

export const DexProvider: React.FC = ({  children }) => {
    const [dex, setDex] = useState<Dex>();
    const basedFinance = useBasedFinance();

    useEffect(() => {
        if (!dex && basedFinance ) {
            const dex = new Dex(basedFinance);
            setDex(dex);
        }
    }, [basedFinance, dex]);

    return <Context.Provider value={{ dex }}>{children}</Context.Provider>;
};
