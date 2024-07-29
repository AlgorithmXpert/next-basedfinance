import React, {useEffect} from 'react';
import styled from 'styled-components';
import {Button, Typography, Box, useMediaQuery} from '@material-ui/core';
import TokenSymbol from '../../../../components/TokenSymbol';
import useTokenBalance from '../../../../hooks/dex/useTokenBalance'
import MetamaskFox from '../../../../assets/img/metamask-fox.svg';
import useBasedFinance from '../../../../hooks/classes/useBasedFinance';


import { useTheme } from '@material-ui/core/styles';
import { DexTokenInfo } from '../../../../based-finance/types';
import useWallet from 'use-wallet';

interface TokenItemProps  {
    tokenName: string;
    tokenSymbol: string;
    tokenInfo: DexTokenInfo;
    selected: boolean;
    handleTokeItemSelect?: (token: DexTokenInfo) => void;
}

const TokenItem: React.FC<TokenItemProps> = ({ tokenName, tokenSymbol, tokenInfo, selected, handleTokeItemSelect, children  }) => {
    const basedFinance = useBasedFinance();
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));

    let tokenBalance = useTokenBalance(tokenInfo.address);
    const { balance, account } = useWallet();

    tokenBalance = tokenInfo.address === '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83' ? Number(balance) / 1e18 : tokenBalance; 

    const selectToken = () => {
        handleTokeItemSelect(tokenInfo)
    }
    const addTokenToMetamask = (event: any) => {
        event.stopPropagation()
        if(basedFinance)
            basedFinance.watchAssetInMetamask(tokenSymbol, tokenInfo.contract);
    }
  
    return (
        <StyledSelectToken>
                <Button onClick={selectToken} style={{backgroundColor: selected ? 'rgba(83, 104, 130, 0.5)' : 'rgba(32, 32, 43, 1.0)', width:'100%'}}>
                    <Box display={'flex'} position={'relative'}  alignItems={'center'}  style={{width:'100%', height:'100%'}}>
                        <TokenSymbol size={25} symbol={tokenSymbol} isSimple={true} style={{height: '25px', marginRight:'4px', marginLeft:'4px'}} />
                        <Typography color='primary' variant={isSmallSizeScreen ? 'h6' : 'h5'} >{tokenName}</Typography>
                        <Button
                            disabled={false}
                            onClick={addTokenToMetamask}
                            color="primary"
                            // variant="outlined"
                            style={{ marginLeft:'5px', opacity: '0.9', width: 'auto', maxWidth: '10px', maxHeight: '25px' }}
                        >
                            <img alt="metamask fox" style={{ maxWidth: '20px' }} src={MetamaskFox} />
                        </Button>
                    </Box>
                    <Box>
                        {account &&
                            <Typography color='primary' style={{fontWeight:'300'}} variant={isSmallSizeScreen ? 'h6' : 'h5'} >{tokenBalance?.toFixed(2)}</Typography>
                        }
                    </Box>
                </Button>
        </StyledSelectToken>
    );
};

const StyledSelectToken = styled.div`
  height: 40px;
  justify-content: 'center';
  align-items: 'center';
  border-radius: 5px;
  padding: 5px;
  margin-right: 4px;
  background-color: rgba(32, 32, 43, 1.0);
  `;


export default TokenItem;
