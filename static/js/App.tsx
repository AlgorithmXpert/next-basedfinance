import React, {Suspense, lazy} from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {ThemeProvider as TP} from '@material-ui/core/styles';
import {ThemeProvider as TP1} from 'styled-components';
import {UseWalletProvider} from 'use-wallet';
import usePromptNetwork from './hooks/common/useNetworkPrompt';
import BanksProvider from './contexts/Banks';
import ProfitProvider from './contexts/ProfitDistributions';
import NodesProviderContext from './contexts/TwistedNodes';

import BasedFinanceProvider from './contexts/BasedFinanceProvider';
import ModalsProvider from './contexts/Modals';
import store from './state';
import theme from './theme';
import newTheme from './newTheme';
import config from './config';
import Updaters from './state/Updaters';
import Loader from './components/Loader';
import Popups from './components/Popups';
import {RefreshContextProvider} from './contexts/RefreshContext';
import ParhtenonProvider from "./contexts/ParthenonProvider";
import useBasedFinance from "./hooks/classes/useBasedFinance";
import KatastimaProvider from "./contexts/KatastimaProvider";
import TwistedNodesProvider from './contexts/TwistedNodesProvider';
import DexProvider from './contexts/DexProvider';

const Home = lazy(() => import('./views/Home'));
const Farming = lazy(() => import('./views/Farming'));
const Boardroom = lazy(() => import('./views/Boardroom'));
const DexPage = lazy(() => import('./views/Dex/DexPage'));
const TwistedNodes = lazy(() => import('./views/TwistedNodes'));
const Exchange = lazy(() => import('./views/Exchange/Exchange'));
const Metrics = lazy(() => import('./views/Metrics'));

const DashboardPage = lazy(() => import('./views/DashboardPage'));

const NoMatch = () => (
    <h3 style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
        URL Not Found. <a href="/">Go back home.</a>
    </h3>
);

const App: React.FC = () => {
    // Clear localStorage for mobile users
    if (typeof localStorage.version_app === 'undefined' || localStorage.version_app !== '1.1') {
        localStorage.clear();
        localStorage.setItem('connectorId', '');
        localStorage.setItem('version_app', '1.1');
    }

  usePromptNetwork();

    return (
        <Providers>
            <Router>
                <Suspense fallback={<Loader/>}>
                    <Switch>
                        {/* <Route exact path="/">
                            <Home/>
                        </Route>
                        <Route path="/farming">
                            <Farming/>
                        </Route>
                        <Route path="/dashboard">
                            <DashboardPage/>
                        </Route>
                         <Route path="/boardroom">
                            <Boardroom/>
                        </Route> */}
                        <Route path="/twistednodes">
                            <TwistedNodes/>
                        </Route>
                        <Route exact path="/">
                            <DexPage/>
                        </Route>
                        <Route path="/dex">
                            <DexPage/>
                        </Route>
                        <Route path="/dexframe">
                            <DexPage/>
                        </Route>
                        <Route path="/exchange">
                            <Exchange/>
                        </Route>
                        {/* <Route path="/metrics">
                            <Metrics/>
                        </Route> */}
                        <Route path="*">
                            <NoMatch/>
                        </Route>
                    </Switch>
                </Suspense>
            </Router>
        </Providers>
    );
};

const Providers: React.FC = ({children}) => {
    return (
        <TP1 theme={theme}>
            <TP theme={newTheme}>
                <UseWalletProvider
                    chainId={config.chainId}
                    connectors={{
                        walletconnect: {rpcUrl: config.defaultProvider},
                        walletlink: {
                            url: config.defaultProvider,
                            appName: 'Based Finance',
                            appLogoUrl: 'https://github.com/basedfinance/basedfinance-assets/blob/master/logo_based_NoBG.png',
                        },
                    }}
                >
                    <Provider store={store}>
                        <Updaters/>
                        <RefreshContextProvider>
                            <BasedFinanceProvider>
                                    <BanksProvider>
                                        <ProfitProvider>
                                            <ParhtenonProvider>
                                                <KatastimaProvider>
                                                    <NodesProviderContext>
                                                        <TwistedNodesProvider>
                                                            <DexProvider>
                                                                <ModalsProvider>
                                                                    <>
                                                                        <Popups/>
                                                                        {children}
                                                                    </>
                                                                </ModalsProvider>
                                                            </DexProvider>
                                                        </TwistedNodesProvider>
                                                    </NodesProviderContext>
                                                </KatastimaProvider>
                                            </ParhtenonProvider>
                                        </ProfitProvider>
                                    </BanksProvider>
                            </BasedFinanceProvider>
                        </RefreshContextProvider>
                    </Provider>
                </UseWalletProvider>
            </TP>
        </TP1>
    );
};

export default App;
