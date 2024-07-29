import { createContext } from 'react';
import { ProfitDistributionInfo } from '../../based-finance';

export interface ProfitDistributionsContext {
  profitDistributions: ProfitDistributionInfo[];
}

const context = createContext<ProfitDistributionsContext>({
  profitDistributions: [],
});

export default context;
