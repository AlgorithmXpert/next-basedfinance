import React from 'react';
import styled, {createGlobalStyle} from 'styled-components';

import Card from '../Card';
import CardContent from '../CardContent';
import Container from '../Container';
import StoasImage from '../../assets/img/stoas.jpg';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


export interface ModalProps {
  opacity?: boolean;
  border?: boolean;
  onDismiss?: () => void;
}


const Modal: React.FC <ModalProps> = ({ opacity = false, border = false, children  }) => {

  const useStyles = makeStyles({
    styledModal: {
      borderRadius: '20px',
      marginTop: '100px',
      background: opacity ? 'linear-gradient(to bottom,rgba(32, 32, 42, 0.92), rgba(32, 32, 42, 0.92))!important' :
      'linear-gradient(to bottom,rgba(32, 32, 42, 1.0), rgba(32, 32, 42, 1.0))!important',
      position: 'relative',
      backgroundSize: 'cover !important',
      maxHeight: '75vh',
      overflowY: 'auto',
      border: border ? '1px solid grey' : '',
    },
  })
  
  const classes = useStyles()

  return (
    <Container size="sm">
        <Box className={classes.styledModal}>
          <CardContent>{children}</CardContent>
        </Box>
    </Container>
  );
};



export default Modal;
