import React, { useCallback, useEffect, useState } from 'react';
import Context from './context';
import useBasedFinance from '../../hooks/classes/useBasedFinance';
import { Bank } from '../../based-finance';
import config, { bankDefinitions } from '../../config';
import { Contract } from 'ethers';

const Banks: React.FC = ({ children }) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const basedFinance = useBasedFinance();
  const isUnlocked = basedFinance?.isUnlocked;

  const fetchPools = useCallback(async () => {
    const banks: Bank[] = [];

    for (const bankInfo of Object.values(bankDefinitions)) {
      if (bankInfo.finished) {
        if (!basedFinance.isUnlocked) continue;

        // only show pools staked by user
        const balance = await basedFinance.stakedBalanceOnBank(
          bankInfo.contract,
          bankInfo.poolId,
          basedFinance.myAccount,
        );
        if (balance.lte(0)) {
          continue;
        }
      }
      
      if( bankInfo.isDepositNft ){
        banks.push({
          ...bankInfo,
          address: config.deployments[bankInfo.contract].address,
          depositToken: basedFinance.contracts[bankInfo.depositTokenName], 
          earnToken: bankInfo.earnTokenName === 'OBOL' ? basedFinance.OBOL : basedFinance.SMELT,
        });
      } else {
        banks.push({
          ...bankInfo,
          address: config.deployments[bankInfo.contract].address,
          depositToken: bankInfo.depositTokenName === 'BBOND' ? basedFinance.BBOND : basedFinance.externalTokens[bankInfo.depositTokenName] , //TODO
          earnToken: bankInfo.earnTokenName === 'OBOL' ? basedFinance.OBOL : basedFinance.SMELT,
        });
      }
    }
    banks.sort((a, b) => (a.sort > b.sort ? 1 : -1));
    setBanks(banks);
  }, [basedFinance, setBanks]);

  useEffect(() => {
    if (basedFinance) {
      fetchPools().catch((err) => console.error(`Failed to fetch pools: ${err.stack}`));
    }
  }, [isUnlocked, basedFinance, fetchPools]);

  return <Context.Provider value={{ banks }}>{children}</Context.Provider>;
};

export default Banks;
