import { createContext } from 'react';
import { TwistedNodesInfo } from '../../based-finance/types';

export interface TwistedNodesContext {
  twistedNodesInfo: TwistedNodesInfo[];
}

const context = createContext<TwistedNodesContext>({
    twistedNodesInfo: [],
});

export default context;
