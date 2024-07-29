import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Container,
    useMediaQuery,
    Typography,
    Button
} from '@material-ui/core';
import {  useTheme } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import useDex from '../../../../hooks/classes/useDex'
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import TokenSymbol from '../../../../components/TokenSymbol';

interface AutoRouteItemProps{
    children?: React.ReactNode;
    symbol: string;
    name: string;
    isLast?: boolean;
}

const AutoRouteItem: React.FC<AutoRouteItemProps> = ({children, symbol, name, isLast = false}) => {
    const [innerBlockState, setInnerBlockState] = useState(false);
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));

    return (
        <>
        <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
            <TokenSymbol size={25} isSimple={true} symbol={symbol} style={{height: '20px', width: 'auto', maxHeight: '20px', marginRight:'4px', marginLeft:'2px'}} />
            <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{name}</Typography>
            <NavigateNextIcon style={{fill:'#DAC0AA', display: isLast ? 'none' : ''}}></NavigateNextIcon>
        </Box>
        </>

    );
}


export default AutoRouteItem;
