import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import BasedFinance from '../../based-finance';
import config from '../../config';

export interface BasedFinanceContext {
  basedFinance?: BasedFinance;
}

export const Context = createContext<BasedFinanceContext>({ basedFinance: null });

export const BasedFinanceProvider: React.FC = ({ children }) => {
  const { ethereum, account } = useWallet();
  const [basedFinance, setBasedFinance] = useState<BasedFinance>();

  useEffect(() => {
    if (!basedFinance) {
      const based = new BasedFinance(config);
      if (account) {
        // wallet was unlocked at initialization
        based.unlockWallet(ethereum, account);
      }
      setBasedFinance(based);
    } else if (account) {
      basedFinance.unlockWallet(ethereum, account);
    }
  }, [account, ethereum, basedFinance]);

  return <Context.Provider value={{ basedFinance }}>{children}</Context.Provider>;
};
