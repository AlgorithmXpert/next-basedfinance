import React, {  useState } from 'react';
import { Box, IconButton, MenuItem, Select, useMediaQuery, Typography } from '@material-ui/core';
import {  useTheme } from '@material-ui/core/styles';

import InfoIcon from '../../../assets/img/icons/info.png';
import Tooltip from '@material-ui/core/Tooltip';

interface InfoToolTipButtonProps {
  children?: React.ReactNode;
  label: string;
  text: string;
}

const InfoToolTipButton: React.FC<InfoToolTipButtonProps> = (props: InfoToolTipButtonProps) => {
  const { children, text, label, ...other } = props;
  const [tooltipIsOpen, setTooltipIsOpen] = React.useState(false);
  const theme = useTheme();
  const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <Tooltip open={tooltipIsOpen} PopperProps={{disablePortal: true}} 
    onOpen={() => setTooltipIsOpen(true)}
    onClose={() => isSmallSizeScreen ?  setTooltipIsOpen(false) : setTooltipIsOpen(false)}
    placement={"right"}
     title={
    <Box>
        <Typography color='primary' variant={'body2'} style={{fontSize: '14px'}}>{text}</Typography>
        {/* <Typography color='primary' style={{fontSize: '14px'}}>{"Claim all (short or medium or long) nodes w 1 tx."}</Typography> */}
    </Box>
    } 
    aria-label={label}>
    <IconButton
        onClick={() => {
        setTooltipIsOpen(!tooltipIsOpen)
        }}
        style={{maxHeight: '15px', maxWidth: '15px'}}
    > 
        <img
        color="none"
        style={{
            width: '16px', height: '16px'
        }}
        src={InfoIcon}
        />
    </IconButton>
    </Tooltip>
  );
};

export default InfoToolTipButton;
