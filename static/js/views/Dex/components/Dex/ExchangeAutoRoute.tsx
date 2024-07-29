import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Container,
    useMediaQuery,
    Typography,
    Button,
    CircularProgress
} from '@material-ui/core';
import {  useTheme } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import useDex from '../../../../hooks/classes/useDex'
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import TokenSymbol from '../../../../components/TokenSymbol';
import AutoRouteItem from './AutoRouteItem'
import { DexSwapInfo, DexTokenInfo } from '../../../../based-finance/types';

interface ExchangeAutoRouteProps{
    children?: React.ReactNode;
    isLoading: boolean;
    autoRoute: DexTokenInfo[];
    hidden: boolean;
}

const ExchageAutoRoute: React.FC<ExchangeAutoRouteProps> = ({isLoading = false, autoRoute, hidden}) => {
    const [innerBlockState, setInnerBlockState] = useState(false);
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [rowsCount, setRowsCount] = useState(0);
    const dex = useDex();

    useEffect(() => {
        if(!autoRoute)
            return;
        setRowsCount(Math.ceil(autoRoute.length/3));
      }, [autoRoute])

      useEffect(() => {
        setInnerBlockState(false);
      }, [isLoading, hidden])

      


    // const route = dex.getRoute("SMELT", "USDC");
    // const pairs = dex.getPairs();
    const showHideInnerBlock = useCallback(async () => {
        setInnerBlockState(!innerBlockState)
      }, [innerBlockState])

    const cardStyle = {
        opacity: innerBlockState ? 1 : 0,
        transitionProperty: 'opacity, height, display',
        // overflow: 'auto',
        transitionDuration: innerBlockState ? '300ms' : '300ms',
        transitionTimingFunction: 'ease-out',
        height: innerBlockState ?  (rowsCount * 30) + 10 : '0px',
        marginTop: '0px', 
        border: '1px solid gray' ,
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '10px' : '0px',
        borderBottomRightRadius: innerBlockState ? '10px' : '0px',
      };
    const boxStyle = {
        display: hidden ? 'none' : '',
        border: '1px solid grey',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '0px' : '10px',
        borderBottomRightRadius: innerBlockState ? '0px' : '10px',
    };
    const contentStyle = {
        width: '100%',
        height: '100%',
        transitionProperty: 'opacity',
        transitionDuration: innerBlockState ? '2200ms' : '300ms',
        opacity: innerBlockState ? 1 : 0,
        marginTop: 0,
        marginBottom: 0,
        overflow: 'hidden'
    };

    return (
        <>
            <Box display={'flex'} alignItems={'center'} justifyContent='space-between'  style={boxStyle}>
                <Box alignItems={'center'}>
                    <Typography style={{marginLeft: '20px'}} variant='body2' color='primary'>Auto Route</Typography>
                </Box>
                <Box alignItems={'center'} justifyContent='space-between'>
                    { isLoading ? (
                            <>
                                <CircularProgress style={{marginRight: '23px'}} size={18} />
                            </>
                        ) : (
                            <>
                                <Button onClick={showHideInnerBlock} style={{borderRadius:'50px'}}>
                                    <KeyboardArrowDownIcon style={{fill:'#DAC0AA'}}></KeyboardArrowDownIcon>
                                </Button>
                            </>
                        )
                    }

                </Box>
            </Box>
            <Container style={cardStyle} >
                    <Box display={'flex'} flexDirection={'row'} flexWrap={'wrap'}  ml={0} mr={0}  alignItems={'center'} justifyContent={'center'}  style={contentStyle}>
                        {autoRoute
                        ?.map((token, index) => (
                            <React.Fragment key={token.name}>
                                <AutoRouteItem symbol={token.symbol} name={token.name} isLast={index === autoRoute.length - 1}/>
                            </React.Fragment>
                        ))}
                    </Box>
               </Container>
        </>

    );
}


export default ExchageAutoRoute;
