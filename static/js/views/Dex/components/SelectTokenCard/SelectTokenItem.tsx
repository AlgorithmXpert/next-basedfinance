import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import {Button, Select, Typography, withStyles, MenuItem, Box, useMediaQuery, ClickAwayListener} from '@material-ui/core';
import TokenSymbol from '../../../../components/TokenSymbol';
import {useWallet} from "use-wallet";
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SelectTokenModal from './SelectTokenModal';
import useModal from '../../../../hooks/common/useModal';
import TokenItem from './TokenItem';
import { DexTokenInfo } from '../../../../based-finance/types';

import { createTheme, useTheme } from '@material-ui/core/styles';


interface SelectWithIconProps  {
    token: DexTokenInfo
    tokens: DexTokenInfo[]
    handleChangeAsset?: (token: DexTokenInfo) => void;
}


const SelectTokenItem: React.FC<SelectWithIconProps> = ({ token, tokens, handleChangeAsset, children  }) => {

    const [selectedToken, setSelectedToken] = useState(token);
    const [showSelectToken, setShowSelectToken] = useState(false);
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));

    useEffect(() => {
      setSelectedToken(token);
    }, [token]);

    useEffect(() => {
        handleChangeAsset(selectedToken);
      }, [selectedToken, setSelectedToken]);

    const handleChangeAssetLocal = (event: any) => {
        const value = event.target.value;
        setSelectedToken(value);
      };

      const handleClickAway = () => {
        if( showSelectToken )
          setShowSelectToken(false);
      };
  
    const showSelectModal = () => {
      setShowSelectToken(!showSelectToken);
    }

    const handleSelectedToken = (tokenName: DexTokenInfo) => {
      setSelectedToken(tokenName);
      setShowSelectToken(false);
      onDismissSelectTokenModal();
    }

    

    const [onPresentSelectTokenModal, onDismissSelectTokenModal] = useModal(
      <SelectTokenModal
        token={token}
        tokens={tokens}
        handleSelectedToken={handleSelectedToken}
      />,
    );
  

  return (
      <StyledSelectToken>
        <ClickAwayListener  onClickAway={handleClickAway}>
          <Box position={'relative'}>
            <Button onClick={onPresentSelectTokenModal} disabled={!selectedToken ? true : false}>
                <Box display={'flex'} position={'relative'} textAlign={'center'}  alignItems={'center'} justifyContent={'center'} style={{minWidth: '50px', minHeight: '30px'}}>
                    <TokenSymbol size={20} symbol={selectedToken?.symbol} isSimple={true} style={{height: '20px', width: 'auto', marginRight:'4px', marginLeft:'2px', display: !selectedToken ? 'none' : ''}} />
                    <Typography style={{marginRight: '2px', fontSize: '14px'}} color='primary' variant={isSmallSizeScreen ? 'h6' : 'h5'} >{!selectedToken ? "Select token" : selectedToken?.name }</Typography>
                </Box>
            </Button>
            {/* <Box position={'absolute'} display={showSelectToken ? 'none' : 'none'} 
                style={{width: '300px', overflow:'hidden', maxHeight: '150px', top: 42, left: 0 ,backgroundColor: 'rgba(32, 32, 43, 1.0)', borderRadius: '10px' , border: '1px solid grey', opacity: '1'}}>
                  <Box  style={{overflow:'auto', margin: '4px', maxHeight: '142px', border: '0px solid red'}}>
                  </Box>
            </Box> */}
          </Box>
        </ClickAwayListener>
      </StyledSelectToken>
  );
};

const StyledSelectToken = styled.div`
  height: 40px;
  border: 1px solid grey;
  justify-content: 'center';
  align-items: 'center';
  border-radius: 10px;
  background-color: rgba(32, 32, 43, 1.0);
  `;

export default SelectTokenItem;
