import React, { useCallback, useMemo, useEffect } from 'react';

import { withStyles, Box, Card, Grid, ThemeProvider, Container, useMediaQuery, Button } from '@material-ui/core';
import { createGlobalStyle } from 'styled-components';
import { createTheme, useTheme } from '@material-ui/core/styles';
import { useRouteMatch } from 'react-router-dom';

import { useWallet } from 'use-wallet';
import { BigNumber } from 'ethers';

import UnlockWallet from '../../components/UnlockWallet';
import PageHeader from '../../components/PageHeader';
import Page from '../../components/Page';

import { OBOL_TICKER, SMELT_TICKER, TICKER } from '../../utils/constants';
import { getFullDisplayBalance } from '../../utils/formatBalance';

import BackgroundImage from '../../components/BackgroundImage';

import KatastimaImage from '../../assets/img/marketplace.jpg';

import Spacer from '../../components/Spacer';
import DexCard from "./components/DexCard"
import DexLiquidity from "./components/LiquidityCard"
import DexTabBar from './components/DexTabBar';
import useDexGetPairs from '../../hooks/dex/useDexGetPairs';
import useDexTokensInfo from '../../hooks/dex/useDexTokensInfo';


const DexPage: React.FC = () => {
  const { account, balance } = useWallet();
  const theme = useTheme();

  let isSmScreen = useMediaQuery(theme.breakpoints.down('sm'));
  let isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
  let isSmallSize = isSmScreen ? true : isXsScreen;
  const { path } = useRouteMatch();
  const [frame, setFrame] = React.useState(false)
  const tokensLength = useDexGetPairs();
  const dexTokensInfo = useDexTokensInfo(tokensLength);

  const [value, setValue] = React.useState(0);
  const [isDataLoading, setIsDataLoading] = React.useState(true);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
      setValue(newValue);
  };

  useEffect(() => {
    const a = document.createElement('a');
    const url = new URL(window.location.href);
    console.log(url.pathname)
    let res = url.pathname.split('/');
    console.log(res)
    if( res.length > 1 ){
      console.log(res[1])
      if( res[1] === 'dexframe' )
        setFrame(true)
    }
    if(res.length > 2){
      console.log(res[2])
      if( res[2] === "add" ){
        setValue(1)
      }
      if( res[2] === "swap" ){
        setValue(0)
      }
      //Open add liquidity
    }
  }, [window.location.href]);
  useEffect(() => {
    if( !dexTokensInfo )
      return;
    setIsDataLoading(false);
  }, [dexTokensInfo]);

  return (
    <>
        {frame && 
          <>
              <Container maxWidth="lg" style={{border: '0px solid red'}}>
                {/* <PageHeader title="Exchange" subtitle="TAX FREE ZONE" icon={''} /> */}
                <Spacer size={'md'}></Spacer>
                  <Grid container justifyContent='center' style={{border: '0px solid blue'}}>
                    <Grid item md={12} sm={12}>
                      <DexTabBar handleBarChange={handleChange} value={value}></DexTabBar>
                    </Grid>
                    <Grid item md={12} sm={12} >
                        <Box display={'flex'} justifyContent='center' style={{ height: '100%', width: '100%', border: '0px solid green'}} >
                          <DexCard value={value} index={0} dexTokensInfo={dexTokensInfo} isLoading={isDataLoading}></DexCard>
                        </Box>
                    </Grid>
                    <Grid item md={12} sm={12} style={{width: '100%', height: '100%'}} >
                        <Box display={'flex'} justifyContent='center' >
                          <DexLiquidity value={value} index={1} dexTokensInfo={dexTokensInfo} isLoading={isDataLoading}></DexLiquidity>
                        </Box>
                    </Grid>
                  </Grid>
              </Container>
          </>
        }
        {!frame && 

          <Page>
          <BackgroundImage url={KatastimaImage}/>
            <>
              <Container maxWidth="lg" style={{border: '0px solid red'}}>
                {/* <PageHeader title="Exchange" subtitle="TAX FREE ZONE" icon={''} /> */}
                <Spacer size={'md'}></Spacer>
                  <Grid container justifyContent='center' style={{border: '0px solid blue'}}>
                    <Grid item md={12} sm={12}>
                      <DexTabBar handleBarChange={handleChange} value={value}></DexTabBar>
                    </Grid>
                    <Grid item md={12} sm={12} >
                        <Box display={'flex'} justifyContent='center' style={{ height: '100%', width: '100%', border: '0px solid green'}} >
                          <DexCard value={value} index={0} dexTokensInfo={dexTokensInfo} isLoading={isDataLoading}></DexCard>
                        </Box>
                    </Grid>
                    <Grid item md={12} sm={12} style={{width: '100%', height: '100%'}} >
                        <Box display={'flex'} justifyContent='center' >
                          <DexLiquidity value={value} index={1} dexTokensInfo={dexTokensInfo} isLoading={isDataLoading}></DexLiquidity>
                        </Box>
                    </Grid>
                  </Grid>
              </Container>
            </>

      </Page>
        }
    </>
  );
};


export default DexPage;
