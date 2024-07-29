import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';

import { Button, useMediaQuery, Box } from '@material-ui/core';
import Input, { InputProps } from '../../../../components/Input';
import SelectTokenItem from './SelectTokenItem'
import TokenInput from './TonekInput';
import { DexTokenInfo } from '../../../../based-finance/types';
import ReactLoading from 'react-loading';
import {useTheme} from "@material-ui/core/styles";
import useWallet from 'use-wallet';


interface TokenInputProps extends InputProps {
  max?: number | string;
  symbol?: string;
  currentToken: DexTokenInfo;
  onSelectHalf?: () => void;
  onSelectMax?: () => void;
  maxTitle?: string
  tokens: DexTokenInfo[]
  handleChangeAsset?: (token: DexTokenInfo) => void;
}

const SelectTokenCard: React.FC<TokenInputProps> = ({ max = "0.0", symbol, currentToken, onChange, onSelectHalf,
 onSelectMax, value, maxTitle, tokens, handleChangeAsset }) => {
  const { account } = useWallet();

  const theme = useTheme();
  const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <StyledTokenInput>
      <TokenInput
        startAdornment={
          <>
             <SelectTokenItem  token={currentToken} tokens={tokens} handleChangeAsset={handleChangeAsset}/>
          </>
        }
        onChange={onChange}
        placeholder="0.0"
        value={value}
      />
      <Box style={{height: '1px', width: '100%', backgroundColor: 'grey', opacity: 0.2}}></Box>
      <Box mb={1} display={'flex'} flexDirection={'row'} justifyContent={'flex-end'} alignItems={'center'}>
        <StyledMaxText style={{display: isSmallSizeScreen ? 'none' : ''}}>
            Balance &nbsp;
        </StyledMaxText>
        <StyledBalanceText>
            { account ? max : "-"}
        </StyledBalanceText>
        <Button  color="secondary" variant="contained" disabled={account ? false : true} onClick={onSelectHalf} 
                style={{marginRight: '10px', maxHeight: '25px', maxWidth: '10px'}}>
                {maxTitle ? maxTitle : '50%'}
          </Button>
        <Button size="small" color="secondary" variant="contained" disabled={account ? false : true} onClick={onSelectMax} 
                style={{marginRight: '10px', maxHeight: '25px'}}>
                {maxTitle ? maxTitle : 'Max'}
          </Button>
      </Box>
    </StyledTokenInput>
  );
};


const StyledInputWrapper = styled.div`
  align-items: center;
  justify-content: center;
  background-color: rgba(32, 32, 43, 0.7);
  border-radius: 5px;
  border:   1px solid white;
  display: flex;
  padding: 0 ${(props) => props.theme.spacing[3]}px;
  '&:focus': {
    border: 1px solid black !important;
  },
`;
const StyledTokenInput = styled.div`
  maxWidth: 100%;
  width: 100%;
  height: 105px;
  border: 1px solid grey;
  border-radius: 10px;
  background-color: rgba(32, 32, 43, 0.7);
`;

const StyledMaxText = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  font-size: 15px;
  font-weight: 500;
  height: 40px;
  margin-left: 10px;
  justify-content: flex-start;
`;

const StyledBalanceText = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  font-size: 15px;
  font-weight: 500;
  height: 44px;
  margin-right: 10px;
  justify-content: flex-end;
`;

export default SelectTokenCard;
