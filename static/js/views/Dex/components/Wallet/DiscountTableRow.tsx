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

interface DiscountTableRowProps {
    tableRows?: string[]
}

const DiscountTableRow: React.FC<DiscountTableRowProps> = (props: DiscountTableRowProps) => {
    const { account } = useWallet();
    const {  tableRows, ...other } = props;
    return (
        <Box display={'flex'} alignItems='center' justifyContent='center' style={{height: '35px'}}>
            <Box display={'flex'} flexGrow={'1'} justifyContent={'center'} alignItems={'center'} style={{minHeight: '30px', minWidth: '200px', maxWidth: '200px', border: '1px solid grey'}}>
                <Typography color={"primary"} style={{fontSize:'14px'}}>{tableRows?.length > 0 ? tableRows[0] : ""}</Typography>
            </Box>
            <Box display={'flex'} flexGrow={'1'} justifyContent={'center'} alignItems={'center'} style={{minHeight: '30px', minWidth: '70px', maxWidth: '70px', border: '1px solid grey', textAlign: 'center'}}>
                <Typography color={"primary"} style={{fontSize:'14px'}}>{tableRows?.length > 1 ? tableRows[1] : ""}</Typography>
            </Box>
            <Box display={'flex'} flexGrow={'1'} justifyContent={'center'} alignItems={'center'}  style={{minHeight: '30px',minWidth: '140px', border: '1px solid grey'}}>
                <Typography color={"primary"}  style={{fontSize:'14px'}}>{tableRows?.length > 2 ? tableRows[2] : ""}</Typography>
            </Box>
            <Box display={'flex'} flexGrow={'1'} justifyContent={'center'} alignItems={'center'}  style={{minHeight: '30px',minWidth: '70px', border: '1px solid grey'}}>
                <Typography color={"primary"} style={{fontSize:'14px'}}>{tableRows?.length > 3 ? tableRows[3] : ""}</Typography>
            </Box>
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

export default DiscountTableRow;
