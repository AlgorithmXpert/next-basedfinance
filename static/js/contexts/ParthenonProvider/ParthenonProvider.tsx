import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import BasedFinance from '../../based-finance';
import {Parthenon} from "../../based-finance/Parthenon";
import config from '../../config';
import useBasedFinance from "../../hooks/classes/useBasedFinance";

export interface ParthenonContext {
    parthenon?: Parthenon;
}

export const Context = createContext<ParthenonContext>({ parthenon: null });

export const ParhtenonProvider: React.FC = ({  children }) => {
    const [parthenon, setParthenon] = useState<Parthenon>();
    const basedFinance = useBasedFinance();

    useEffect(() => {
        if (!parthenon && basedFinance ) {
            const parthenon = new Parthenon(basedFinance);
            setParthenon(parthenon);
        }
    }, [basedFinance, parthenon]);

    return <Context.Provider value={{ parthenon }}>{children}</Context.Provider>;
};
