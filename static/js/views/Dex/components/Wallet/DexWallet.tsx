import React, { useCallback, useEffect, useState } from 'react';
import { Box, Grid, MenuItem, Select, withStyles, Typography, useMediaQuery, Button } from '@material-ui/core';

import TokenInput from '../../../../components/based/BasedTokenInput/TokenInput';
import { SMELT_TICKER, TICKER } from '../../../../utils/constants';
import styled from 'styled-components';
import colors from '../../../../theme/colors';
import { useWallet } from 'use-wallet';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';
import Spacer from '../../../../components/Spacer';
import DexTabBar from '../DexTabBar';
import DexExchangeTabPanel from '../DexExchangeTabPanel'
import DexLiquidityTabPanel from '../DexLiquidityTabPanel';
import WalletToken from './WalletToken'
import DiscountTable from './DiscountTable'
import useModal from '../../../../hooks/common/useModal';
import InfoToolTopButton from '../InfoToolTipButton';

import useDex from '../../../../hooks/classes/useDex';
import { DexAcountTokenInfo, DexSwapInfo, DexUserDiscount } from '../../../../based-finance/types';


interface DexWalletProps {
  isLoading: boolean;
  swapInfo?: DexSwapInfo;
}

const DexWallet: React.FC<DexWalletProps> = ({isLoading, swapInfo}) => {
    const { account } = useWallet();
    const dex = useDex();
    const [walletDiscountTokens, setWalletDiscountTokens] = useState<DexAcountTokenInfo[]>([]); //useGetMyWalletDiscountTokens(isLoading);

    const truncate = (str: string, n: number) => {
		return str?.length > n ? str.substr(0, n - 1) + "..." + str.substr(str.length - n, n) : str;
	};

  const [onPresentDiscountTable, onDismissDiscountTable] = useModal(
    <DiscountTable discountTable={swapInfo?.discountTable}
    />,
  );
  let dexTokensDiscount: { [address: string]: DexUserDiscount } = {};

  const [userTokenInfo, setUserTokenInfo] = useState<DexAcountTokenInfo>();
  
  useEffect(() => {

      if( !swapInfo )
      {
        setWalletDiscountTokens([]);
        return;
      }
      dexTokensDiscount = {};
      if( !swapInfo.userDiscounts )
        return;

      for( let i = 0; i < swapInfo.userDiscounts.length; i++ ){
          for(let k = 0; k < swapInfo.userDiscounts[i].length; k++ ){
              const discTable = swapInfo.userDiscounts[i][k];
              dexTokensDiscount[discTable.tokenAddress] = discTable;
          }
      }

     let accTokenInfo : DexAcountTokenInfo[] = [];

      for (var key in dexTokensDiscount) {
        if (dexTokensDiscount.hasOwnProperty(key)) {
          try{
            const discount = dexTokensDiscount[key];
            // token: DexTokenInfo;
            // totalDiscount: number;
            // ditscounts: DexDiscountToken[];
            // balance: number;
            let tokenInfo : DexAcountTokenInfo = {token : dex.dexTokens[discount.tokenAddress],
              totalDiscount: discount.userDiscount / 100, balance: discount.userBalance, discounts: discount.discountAmount}
              accTokenInfo.push(tokenInfo);
          }
          catch(error){
            console.log(error)
          }
      }
    }
    setWalletDiscountTokens(accTokenInfo);


    }, [swapInfo]);

    return (
    <Box display={'flex'}  flexDirection={'column'} textAlign={'center'} style={{ backgroundColor: 'rgba(32, 32, 43, 0.75)' ,
      borderRadius: 20,
      border: '1px solid #DAC0AA',
      padding: 15}}>
        <Box>
            <Typography variant='h4' color='primary'>My Wallet</Typography>
        </Box>
        <Spacer size='sm'/>
        <Box display={'flex'} justifyContent={'space-around'} alignItems={'center'} style={{border: '1px solid grey', height:'40px', borderRadius: '10px'}}>
            <Typography variant='h6' color='primary'>{truncate(account, 9)}</Typography>
            <Button onClick={() => { window.open("https://ftmscan.com/address/" + account, '_blank', 'noopener,noreferrer')}} style={{height: '75%'}} variant='contained' color='secondary'>FTM SCAN</Button>
        </Box>
        <Spacer size='md'/>
        <Box display={'flex'} justifyContent={'space-around'} alignItems={'center'} style={{border: '0px solid grey', height:'40px', borderRadius: '10px'}}>
            <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                <Typography variant='h6' color='primary'>Based Holdings</Typography>
                <InfoToolTopButton label={"Swap-Holdings"} text={"Based Holdings Discounts reflect Info for current Pair. This Info updates dynamically depending on Route for current trading Pair."}/>
            </Box>
            <Button disabled={isLoading ? true : !swapInfo || swapInfo?.discountTable.length === 0 || swapInfo.discountTable[0].length === 1} style={{height: '80%', fontSize: '12px', opacity: isLoading ? '0.6' : '1.0'}} onClick={onPresentDiscountTable} variant='contained' color='secondary'>Discount Table</Button>
        </Box>
        <Spacer size='md'/>
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} gridGap={2} style={{border: '1px solid grey', width: '100%', height:'100%', maxHeight:'260px', minHeight: '145px', borderRadius: '10px', overflow:'auto'}}>
          <Spacer size='sm'/>
          {walletDiscountTokens
          ?.map((token, index) => (
              <React.Fragment key={token?.token.name}>
                <WalletToken  dexAccountTokenInfo={token}></WalletToken>
              </React.Fragment>
          ))}
        </Box>
        <Spacer size='sm'/>
        <Button onClick={() => { window.open("https://omniportal.io/bridge")}} variant='outlined' color='primary'>BRIDGE BASED TO AVAX</Button>
    </Box>
    );
};

const styles = {
  swapContainer: {
    backgroundColor: 'rgba(32, 32, 43, 0.75)',
    borderRadius: 20,
    border: '1px solid #DAC0AA',
    padding: 15,
    marginTop: 0,
    marginBottom: 0,
    maxWidth: '400px',
    maxHeight: '500px'
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

export default DexWallet;
