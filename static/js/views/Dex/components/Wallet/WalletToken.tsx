import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Container,
    useMediaQuery,
    Typography,
    Button,
} from '@material-ui/core';
import { createTheme, useTheme, makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import TokenSymbol from '../../../../components/TokenSymbol';
import Spacer from '../../../../components/Spacer';
import { DexAcountTokenInfo, DexSwapInfo } from '../../../../based-finance/types';
import WalletDiscountToken from './WalletDiscountToken'

interface WalletTokenProps{
    children?: React.ReactNode;
    dexAccountTokenInfo: DexAcountTokenInfo;
    swapInfo?: DexSwapInfo;
}

const WalletToken: React.FC<WalletTokenProps> = ({children, dexAccountTokenInfo, swapInfo}) => {
    const [innerBlockState, setInnerBlockState] = useState(false);
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));

    const showHideInnerBlock = useCallback(async () => {
        setInnerBlockState(!innerBlockState)
        // once the request is sent, update state again
      }, [innerBlockState]) // update the callback if the state changes

    const cardStyle = {
        opacity: innerBlockState ? 1 : 0,
        transitionProperty: 'opacity, height, display',
        transitionDuration: innerBlockState ? '350ms' : '350ms',
        transitionTimingFunction: 'ease-out',
        height: innerBlockState ?  90  : '0px',
        width:'95%',
        border: '1px solid gray' ,
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '10px' : '0px',
        borderBottomRightRadius: innerBlockState ? '10px' : '0px',
      };
    const boxStyle = {
        border: '1px solid grey',
        height: '40px',
        borderRadius: '10px',
        width: '95%',
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '0px' : '10px',
        borderBottomRightRadius: innerBlockState ? '0px' : '10px',
    };
    const contentStyle = {
        width: '100%',
        transitionProperty: 'opacity',
        transitionDuration: innerBlockState ? '2000ms' : '200ms',
        opacity: innerBlockState ? 1 : 0,
    };

    return (
        <>
            <Box display={'flex'} alignItems={'center'} justifyContent='space-between'  style={boxStyle}>
                <Box display={'flex'} ml={2} alignItems={'center'} justifyContent={'center'} style={{height: '100%'}}>
                    <TokenSymbol size={30} isSimple={true} symbol={dexAccountTokenInfo.token.symbol} style={{height: '30px', width: 'auto', marginTop: '2px'}} />
                </Box>
                <Box display={'flex'} ml={2} alignItems={'center'} justifyContent={'center'} style={{height: '100%'}}>
                    <Typography variant='body2' style={{fontWeight: '100', fontSize: '14px'}} color={'primary'}>{dexAccountTokenInfo.token.name}</Typography>
                </Box>
                <Box display={'flex'} ml={2} alignItems={'center'} justifyContent={'center'} style={{height: '100%'}}>
                    <Typography variant='body2' style={{fontWeight: '100', fontSize: '14px'}} color={'primary'}>{dexAccountTokenInfo.balance.toFixed(2)}</Typography>
                </Box>
                <Box display={'flex'} alignItems={'center'} justifyContent='space-between'>
                    <Button onClick={showHideInnerBlock} style={{borderRadius:'50px'}}>
                        <KeyboardArrowDownIcon style={{fill:'white'}}></KeyboardArrowDownIcon>
                    </Button>
                </Box>
            </Box>
            {innerBlockState ? (
                    <Container style={cardStyle} >
                        <Box style={{alignItems:'center', justifyContent:'center', display:'flex', marginTop: '10px'}}  >
                        <Grid container direction='row' spacing={2} justifyContent='center'  style={{
                            width: '95%' ,
                            height: 90  ,
                            borderRadius: '20px',
                            display: 'flex',
                            overflow: 'auto',
                            border: '0px solid gray' }} >
                            <Box display={'flex'} mt={1} flexDirection={'column'} style={contentStyle}>
                                <Box mr={1} ml={1} mt={1} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                                    <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Discount:</Typography>
                                    <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{dexAccountTokenInfo.totalDiscount}%</Typography>
                                </Box>
                                <Box mr={1} ml={1} mt={1} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                                    <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Condit:</Typography>
                                    <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{">= " + dexAccountTokenInfo.discounts}</Typography>
                                </Box>
                                {/* {dexAccountTokenInfo?.discounts
                                ?.map((token, index) => (
                                    <React.Fragment key={token.tokenName}>
                                        <WalletDiscountToken discountToken={token} />
                                    </React.Fragment>
                                ))} */}
                            </Box>
                        </Grid>
                        </Box>
                    </Container>
            ) : (
                <>
                </>
            )
            }

        </>

    );
}


export default WalletToken;
