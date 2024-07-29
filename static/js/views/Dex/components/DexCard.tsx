import React, { useCallback, useEffect, useState } from 'react';
import { Button, Grid } from '@material-ui/core';
import colors from '../../../theme/colors';
import Spacer from '../../../components/Spacer';
import DexExchangeTabPanel from './DexExchangeTabPanel'
import DexWallet from './Wallet/DexWallet';
import { Box } from 'react-feather';
import { DexTokenInfo } from '../../../based-finance';
import { DexDiscountTable, DexSwapInfo, DexUserDiscount } from '../../../based-finance/types';
import useWallet from 'use-wallet';


interface DexCardProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
  dexTokensInfo: DexTokenInfo[];
  isLoading: boolean;
}

const DexCard: React.FC<DexCardProps> = (props: DexCardProps) => {
  const { children, value, index, dexTokensInfo, isLoading, ...other } = props;

  const { account, balance } = useWallet();

  const [updatedSwapInfo, setUpdatedSwapInfo] = useState<DexSwapInfo>()
  function setSwapInfo (swapInfo: DexSwapInfo) {
    setUpdatedSwapInfo(swapInfo);
  }

  return (
    <Grid container
    component="div"
    justifyContent='center' 
    role="tabpanel"
    hidden={value !== index}
    id={`full-width-tabpanel-${index}`}
    aria-labelledby={`full-width-tab-${index}`}
    style={{border: '0px solid blue', display: value !== index ? 'hidden' : 'flex', position: 'relative'}}
    {...other}
    >
    <Grid hidden={value !== index}  item xs={12} md={account ? 6 : 12} style={styles.swapContainer}>
        <DexExchangeTabPanel value={value} index={0} dexTokensInfo={dexTokensInfo} isLoading={isLoading} setSwapInfo={setSwapInfo} ></DexExchangeTabPanel>
    </Grid>
             {/**/}
        { account &&  
          <Grid hidden={value !== index} item xs={12} md={6} style={styles.walletContainer}>
                <DexWallet isLoading={isLoading} swapInfo={updatedSwapInfo}/>
          </Grid>
         }
  </Grid>
  );
};

const styles = {
  swapContainer: {
    // backgroundColor: 'rgba(32, 32, 43, 0.75)',
    // borderRadius: 20,
    // border: '1px solid #DAC0AA',
    // padding: 15,
    marginTop: 0,
    marginBottom: 0,
    maxWidth: '400px',
    minWidth: '350px',
    margin: 2
  },
  walletContainer: {
    // backgroundColor: 'rgba(32, 32, 43, 0.75)',
    // borderRadius: 20,
    // border: '1px solid #DAC0AA',
    // padding: 15,
    marginTop: 0,
    marginBottom: 0,
    maxWidth: '400px',
    width: '200px',
    minWidth: '350px',
    maxHeight: '450px',
    margin: 2
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

export default DexCard;
