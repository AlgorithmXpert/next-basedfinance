import React, { useCallback, useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Container,
    useMediaQuery,
    Typography,
    Button,
    IconButton,
    CircularProgress
} from '@material-ui/core';
import {  useTheme } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { DexSwapInfo } from '../../../../based-finance/types';
import InfoToolTopButton from '../InfoToolTipButton';

interface ExchangeDropDownProps{
    children?: React.ReactNode;
    swapInfo?: DexSwapInfo;
    hidden: boolean;
    isLoading: boolean;
}

const ExchangeDropDown: React.FC<ExchangeDropDownProps> = ({children, swapInfo, hidden, isLoading}) => {
    const [innerBlockState, setInnerBlockState] = useState(false);
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));

    const token0Price = swapInfo ? swapInfo.isMainTokenChanged ?  swapInfo.token0Price : swapInfo.token1Price : ''
    const token1Price = swapInfo ? swapInfo.isMainTokenChanged ?  swapInfo.token1Price : swapInfo.token0Price : ''
    const token0Name = swapInfo ? swapInfo.isMainTokenChanged ? swapInfo.token0.name : swapInfo.token1.name : ''
    const token1Name = swapInfo ? swapInfo.isMainTokenChanged ? swapInfo.token1.name : swapInfo.token0.name : ''
    const minRecieved = swapInfo? swapInfo.minRecieved : '0'
    const priceImact = swapInfo ? swapInfo.priceImpact < 0.01 ? "<0.01" : swapInfo.priceImpact.toFixed(2) : '0.0'
    const fee = swapInfo ? swapInfo.fee.toFixed(1) : '0.0';
    const tax = swapInfo ? swapInfo.sellTax.toFixed(2) : '0.0';
    const discount = swapInfo ? swapInfo.discount.toFixed(2) : '0.0';

    const [boxWarning, setBoxWarning] = useState(false);
    const [warningText, setWarningText] = useState('Price impact!');
    const [warningState, setWarningState] = useState(0); //0 - bad state 1 - mid 2 - good state 

    useEffect(() => {
        setInnerBlockState(false)
      }, [hidden]);

      useEffect(() => {
        if(!swapInfo)
            return;

        if( swapInfo.priceImpact > 0 && swapInfo.priceImpact <= 1 ){
            setBoxWarning(true);
            // setInnerBlockState(true);
            setWarningState(2)
        } else if( swapInfo.priceImpact > 1 && swapInfo.priceImpact <= 3 ){
            setBoxWarning(true);
            setInnerBlockState(true);
            setWarningState(1)
        } else if( swapInfo.priceImpact > 3 ){
            setBoxWarning(true);
            setInnerBlockState(true);
            setWarningState(0)
        }
        else{
            setBoxWarning(false);
        }
    }, [priceImact]);

    const showHideInnerBlock = useCallback(async () => {
        setInnerBlockState(!innerBlockState)
      }, [innerBlockState])

    const cardStyle = {
        opacity: innerBlockState ? 1 : 0,
        transitionProperty: 'opacity, height, display',
        // overflow: 'auto',
        transitionDuration: innerBlockState ? '300ms' : '300ms',
        transitionTimingFunction: 'ease-out',
        height: innerBlockState ?  Number(tax) > 0 ? '170px' : '105px' : '0px',
        marginTop: '0px', 
        border: boxWarning ?  warningState === 2 ? '1px solid #14F08F' : warningState  === 1 ? '1px solid #F0AB2D' : '1px solid #EB4768' : '1px solid gray' ,
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '10px' : '0px',
        borderBottomRightRadius: innerBlockState ? '10px' : '0px',
      };
    const boxStyle = {
        display: hidden ? 'none' : '',
        border: boxWarning ?  warningState === 2 ? '1px solid #14F08F' : warningState  === 1 ? '1px solid #F0AB2D' : '1px solid #EB4768' : '1px solid gray' ,
        height: '40px',
        borderRadius: '10px',
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '0px' : '10px',
        borderBottomRightRadius: innerBlockState ? '0px' : '10px',
    };
    const contentStyle = {
        width: '100%',
        transitionProperty: 'opacity',
        transitionDuration: innerBlockState ? '200ms' : '1000ms',
        opacity: innerBlockState ? 1 : 0,
    };

    return (
        <>
            <Box display={'flex'} alignItems={'center'} justifyContent='space-between'  style={boxStyle}>
                <Box alignItems={'center'}>
                    { swapInfo && !isLoading ? (
                        <>
                            <Typography style={{marginLeft: '20px', display: swapInfo ? '' : 'none'}} variant='body2' color='primary'>{token0Price.substring(0,10)} {token0Name} = {token1Price.substring(0,10)} {token1Name}</Typography>
                        </>
                    ) : (
                        <>
                            <CircularProgress style={{marginLeft: '25px', marginTop: '5px'}} size={25}></CircularProgress>
                        </>
                    )
                    }
                </Box>
                <Box alignItems={'center'} justifyContent='space-between'>
                    <Button onClick={showHideInnerBlock} style={{borderRadius:'50px'}}>
                        <KeyboardArrowDownIcon style={{fill:'#DAC0AA'}}></KeyboardArrowDownIcon>
                    </Button>
                </Box>
            </Box>
            <Container style={cardStyle} >
                <Box style={{alignItems:'center', justifyContent:'center', display:'flex', marginTop: '10px'}}  >
                <Grid container direction='row' spacing={1}  style={contentStyle} justifyContent='center'>
                    <Grid item xs={12} >
                        <Box display={'flex'} mt={0} flexDirection={'column'}>
                            <Box mr={1} ml={1} display={'flex'} flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
                                <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                                    <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{swapInfo?.isMainTokenChanged ? "Min recieved" : "Max sold"} </Typography>
                                    <InfoToolTopButton label={"Swap-MinRecieved"} text={"Includes Tax (if any) , Discount (if any), Slippage."}/>
                                </Box>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{minRecieved.substring(0, 10)}</Typography>


                            </Box>
                            <Box mr={1} ml={1} mt={1} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                                <Typography variant='h5' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Price impact</Typography>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px',
                                 color: boxWarning ?  warningState === 2 ? '#14F08F' : warningState  === 1 ? '#F0AB2D' : '#EB4768' : 'lightgray'}}>{priceImact}%</Typography>
                            </Box>
                            <Box mr={1} ml={1} mt={1} display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                                    <Typography variant='h5' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Fee</Typography>
                                    <InfoToolTopButton label={"Swap-Fee"} text={"Fee paid to Liquidity Providers."}/>
                                </Box>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{fee}%</Typography>
                            </Box>
                            <Box mr={1} ml={1} mt={1} display={ Number(tax) > 0 ? 'flex' : 'none'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                                    <Typography variant='h5' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Tax</Typography>
                                    <InfoToolTopButton label={"Swap-Tax"} text={"Buy / Sell Tax (if any)."}/>
                                </Box>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{tax}%</Typography>
                            </Box>
                            <Box mr={1} ml={1} mt={1} display={ Number(tax) > 0 ? 'flex' : 'none'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                                    <Typography variant='h5' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Discount</Typography>
                                    <InfoToolTopButton label={"Swap-Discount"} text={"Discount on Tax depends on your Based Holdings. Please refer to Discount Table for more info."}/>
                                </Box>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{discount}%</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                </Box>
            </Container>
        </>

    );
}



export default ExchangeDropDown;
