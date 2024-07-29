import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';

import { Button, Box, Typography } from '@material-ui/core';
import { InputProps } from '../../../../components/Input';
import TokenInput from '../SelectTokenCard/TonekInput';
 

interface TokenInputProps extends InputProps {
  name: string;
  max?: number | string;
  onSelectHalf?: () => void;
  onSelectMax?: () => void;
  maxTitle?: string
  handleChangeAsset?: (token: string) => void;
}

const SelectTokenCard: React.FC<TokenInputProps> = ({ max = "0.0", onChange, onSelectHalf, onSelectMax, value, maxTitle, handleChangeAsset, name }) => {

  const showSelectModal = () => {
    console.log("Show select")
  }

  return (
    <StyledTokenInput>
      <TokenInput
        startAdornment={
          <>
            <Typography variant='h5' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{name}</Typography>
          </>
        }
        onChange={onChange}
        placeholder="0.0"
        value={value}
      />
      <Box mt={1} style={{height: '1px', width: '100%', backgroundColor: 'grey', opacity: 0.2}}></Box>
      <Box mb={1} display={'flex'} flexDirection={'row'} justifyContent={'flex-end'} alignItems={'center'}>
        <StyledMaxText>
            Balance &nbsp;
        </StyledMaxText>
        <StyledBalanceText>
            {max}
        </StyledBalanceText>
        <Button  color="secondary" variant="contained" onClick={onSelectHalf} 
                style={{marginRight: '10px', maxHeight: '25px', maxWidth: '10px'}}>
                {maxTitle ? maxTitle : '50%'}
          </Button>
        <Button size="small" color="secondary" variant="contained" onClick={onSelectMax} 
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
  border:   0px solid white;
  display: flex;
  padding: 0 ${(props) => props.theme.spacing[3]}px;
  '&:focus': {
    border: 1px solid black !important;
  },
`;
const StyledTokenInput = styled.div`
  maxWidth: 100%;
  width: 100%;
  height: 115px;
  border: 0px solid grey;
  border-radius: 10px;
  background-color: rgba(32, 32, 43, 0.7);
`;

const StyledMaxText = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  font-size: 14px;
  font-weight: 700;
  height: 44px;
  margin-left: 10px;
  justify-content: flex-start;
`;

const StyledBalanceText = styled.div`
  align-items: center;
  color: ${(props) => props.theme.color.grey[400]};
  display: flex;
  font-size: 14px;
  font-weight: 700;
  height: 44px;
  margin-right: 10px;
  justify-content: flex-end;
`;

export default SelectTokenCard;
