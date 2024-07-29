import React from 'react';
import styled from 'styled-components';

import Modal, { ModalProps } from '../Modal';
import ModalTitle from '../ModalTitle';
import TokenSymbol from '../TokenSymbol';
import {Button, withStyles} from '@material-ui/core';
import CloseIcon from "@material-ui/icons/Close";

const ChartsModal: React.FC<ModalProps> = ({ onDismiss }) => {
  return (
    <Modal opacity={true} border={true}>
      <StyledCloseIcon
          onClick={onDismiss}
      />
      <ModalTitle text="DexScreener Charts" />
      <Balances>
       
        <StyledBalanceWrapper>
          <TokenSymbol symbol="OBOL" />
          <Button
            style={{ marginTop: '18px', marginBottom: '24px', fontSize: '0.75rem' }}
            variant="contained"
            color={"secondary"}
            target="_blank"
            href="https://dexscreener.com/fantom/0xe3e26bd9cd2f32a8f60bfff5df88bb3b3c5eb9f9"
          >
           VIEW
          </Button>
        </StyledBalanceWrapper>
        <StyledBalanceWrapper>
          <TokenSymbol symbol="SMELT" />
          <Button
            style={{ marginTop: '18px', marginBottom: '24px', fontSize: '0.75rem' }}
            variant="contained"
            color={"secondary"}
            target="_blank"
            href="https://dexscreener.com/fantom/0x432a4654bc67ed86b3119cd256c490f2cea1e42a"
          >
           VIEW
          </Button>
        </StyledBalanceWrapper>

      </Balances>
    </Modal>
  );
};

const Balances = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`;

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 0 ${(props) => props.theme.spacing[3]}px;
`;

const StyledCloseIcon = withStyles({
  root: {
    position: 'absolute',
    right: '5px',
    top: '5px',
    padding: '10px',
    cursor: 'pointer',
    transition: '0.3s ease-in-out',
    color: '#fff',
    '&:hover': {
      color: '#a97c50',
      transition: '0.3s ease-in-out'
    }
  },
})(CloseIcon);

export default ChartsModal;
