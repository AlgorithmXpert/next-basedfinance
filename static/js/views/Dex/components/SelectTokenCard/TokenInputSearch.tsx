import React from 'react';
import styled from 'styled-components';

export interface InputProps {
  endAdornment?: React.ReactNode;
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
  placeholder?: string;
  startAdornment?: React.ReactNode;
  value: string;
}

const TokenInputSearch: React.FC<InputProps> = ({ endAdornment, onChange, placeholder, startAdornment, value }) => {
  return (
    <StyledInputWrapper>
      {!!startAdornment && startAdornment}
      <StyledInput placeholder={placeholder} value={value} onChange={onChange} />
      {!!endAdornment && endAdornment}
    </StyledInputWrapper>
  );
};

const StyledInputWrapper = styled.div`
  align-items: center;
  background-color: rgba(32, 32, 43, 0.0);
  border-radius: 5px;
  border:   0px solid white;
  display: flex;
  padding: 0 ${(props) => props.theme.spacing[3]}px;
  '&:focus': {
    border: 0px solid black !important;
  },
`;

const StyledInput = styled.input`
  background: none;
  border: 0px;
  color: ${(props) => props.theme.color.grey[100]};
  font-size: 18px;
  flex: 1;
  height: 45px;
  text-align: left;
  margin: 0;
  padding: 0;
  outline: none;
  width: 100%;

`;

export default TokenInputSearch;
