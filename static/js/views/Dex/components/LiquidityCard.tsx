import React, {  useState } from 'react';
import { Box, Grid, MenuItem, Select, withStyles, Typography, useMediaQuery } from '@material-ui/core';
import {  TICKER } from '../../../utils/constants';
import colors from '../../../theme/colors';
import Spacer from '../../../components/Spacer';
import DexTabBar from './DexTabBar';
import MyLiquidityTabPanel from './MyLiquidityTabPanel'
import DexLiquidityTabPanel from './DexLiquidityTabPanel';
import { DexTokenInfo } from '../../../based-finance/types';
import useWallet from 'use-wallet';

const receiveAssetsBySmelt = [TICKER.OBOL];
const receiveAssets = [TICKER.SMELT];
const assets = [TICKER.SHARE_FTM_LP, TICKER.SMELT];


interface LiquidityCardProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
  dexTokensInfo: DexTokenInfo[];
  isLoading: boolean;
}

const LiquidityCard: React.FC<LiquidityCardProps> = (props: LiquidityCardProps) => {
  const { children, value, index, dexTokensInfo, isLoading, ...other } = props;
  const { account } = useWallet();

    const [tabValue, setTabValue] = useState(0);
    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        if( !account )
          return
        setTabValue(newValue);
        switch(newValue){
            case 0:
            break;
            case 1:
            break;
            case 2:
            break;
        }
    };

    const [selectedToken0, setSelectedToken0] = useState<DexTokenInfo>();
    const [selectedToken1, setSelectedToken1] = useState<DexTokenInfo>();

    function supplyShowed() {
      setSelectedToken0(undefined);
      setSelectedToken1(undefined);
    }
    
    function showSupply(token0: DexTokenInfo, token1: DexTokenInfo ) {
      setSelectedToken0(token0);
      setSelectedToken1(token1);
      setTabValue(0);
    }
  return (

    <Grid container 
    role="tabpanel"
    component="div"
    justifyContent='center'
    hidden={value !== index}
    id={`full-width-tabpanel-${index}`}
    aria-labelledby={`full-width-tab-${index}`}
    // display={ value !== index ? 'none' : 'flex'}
    style={{width: '100%'}}
    {...other}>
      <Grid hidden={value !== index}  item xs={12} md={12} style={styles.swapContainer}>
      <Grid container style={{padding: '15px'}}>
            <Grid item xs={12} hidden={value !== index}>
                <DexTabBar handleBarChange={handleChange} value={tabValue} firstTitle={"Supply"} secondTitle={"My Liquidity"}></DexTabBar>
            </Grid>
            <Grid item xs={12} hidden={value !== index}>
                <DexLiquidityTabPanel supplyShowed={supplyShowed} value={tabValue} index={0} parentValue={value} parentIndex={index} dexTokensInfo={dexTokensInfo} isLoading={isLoading} token0={selectedToken0} token1={selectedToken1}></DexLiquidityTabPanel>
            </Grid>
            <Grid item xs={12} hidden={value !== index}>
                <MyLiquidityTabPanel showSupply={showSupply} value={tabValue} index={1} isLoading={isLoading} ></MyLiquidityTabPanel>
            </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const styles = {
  swapContainer: {
    backgroundColor: 'rgba(32, 32, 43, 0.75)',
    borderRadius: 20,
    border: '1px solid #DAC0AA',
    // padding: 15,
    // marginTop: 0,
    // marginBottom: 0,
    margin: 2,
    maxWidth: '400px',
    minWidth: '350px',
  },
  liqContainer: {
    // backgroundColor: 'rgba(32, 32, 43, 0.75)',
    // borderRadius: 20,
    // border: '1px solid #DAC0AA',
    padding: 15,
    // marginTop: 0,
    // marginBottom: 0,
    // margin: 2,
    // maxWidth: '400px',
    // minWidth: '350px',
  },
  swapLabel: {
    color: colors.based[700],
    marginBottom: 2,
  },
  swapSelect: {
    color: colors.based[700],
    width: '100%',
    '& .MuiSvgIconRoot?': {
      color: 'white',
    },
  },
  availBalanceContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    flex: 1,
    width: '100%',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginRight: 8,
    marginLeft: 8,
  },
  availBalanceTitle: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  availBalanceValue: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    color: colors.grey[500],
    width: 200,
  },
};

export default LiquidityCard;
