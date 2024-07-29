import React, { createContext, useEffect, useState } from 'react';
import {Katastima} from "../../based-finance/Katastima";
import useBasedFinance from "../../hooks/classes/useBasedFinance";

export interface KatastimaContext {
    katastima?: Katastima;
}

export const Context = createContext<KatastimaContext>({ katastima: null });

export const KatastimaProvider: React.FC = ({  children }) => {
    const [katastima, setKatastima] = useState<Katastima>();
    const basedFinance = useBasedFinance();

    useEffect(() => {
        if (!katastima && basedFinance ) {
            const parthenon = new Katastima(basedFinance);
            setKatastima(parthenon);
        }
    }, [basedFinance, katastima]);

    return <Context.Provider value={{ katastima }}>{children}</Context.Provider>;
};