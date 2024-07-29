import React, { useCallback, useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Container,
    useMediaQuery,
    Typography,
    Button,
    CircularProgress
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { DexLiquidityInfo } from '../../../../based-finance/types';

interface LiquidityPoolShareProps{
    children?: React.ReactNode;
    liquidityInfo: DexLiquidityInfo;
    isLoading: boolean;
}

const LiquidityPoolShare: React.FC<LiquidityPoolShareProps> = ({liquidityInfo, isLoading}) => {
    const [innerBlockState, setInnerBlockState] = useState(false);
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));


    const token0Price = liquidityInfo ? liquidityInfo.isMainTokenChanged ?  '1' : '1' : ''
    const token1Price = liquidityInfo ? liquidityInfo.isMainTokenChanged ?  liquidityInfo.token1Price : liquidityInfo.token0Price : ''
    const token0Name = liquidityInfo ? liquidityInfo.isMainTokenChanged ? liquidityInfo.token0.name : liquidityInfo.token1.name : ''
    const token1Name = liquidityInfo ? liquidityInfo.isMainTokenChanged ? liquidityInfo.token1.name : liquidityInfo.token0.name : ''
    const shareOfPool = liquidityInfo? liquidityInfo.shareOfPool > 100 ? '100' : liquidityInfo.shareOfPool < 0.01 ? "<0.01" : liquidityInfo.shareOfPool.toFixed(2) : '0'
    const lps = liquidityInfo? liquidityInfo.lpAmount.toFixed(8) : '0'
    const [boxWarning, setBoxWarning] = useState(false);
    const [warningText, setWarningText] = useState('Price impact!');
    const [warningState, setWarningState] = useState(0); //0 - bad state 1 - good state

    const showHideInnerBlock = useCallback(async () => {
        setInnerBlockState(!innerBlockState)
      }, [innerBlockState])

    //   useEffect(() => {
    //     if( isLoading )
    //         setInnerBlockState(false)
    //   }, [isLoading]);

      useEffect(() => {
        if( !liquidityInfo )
            return;

        if( liquidityInfo.isPairNew ){
            setBoxWarning(true)
            setWarningState(0)
            setInnerBlockState(true);
        }
        else 
            setBoxWarning(false)

        // if( liquidityInfo.shareOfPool > 2 && liquidityInfo.shareOfPool < 10 ){
        //     setBoxWarning(true)
        //     setWarningState(1)
        //     setInnerBlockState(true);
        // }
        // else if( liquidityInfo.shareOfPool >= 10 ) {
        //     setBoxWarning(true)
        //     setWarningState(0)
        //     setInnerBlockState(true);
        // }
        // else {
        //     setBoxWarning(false)
        // }
      }, [liquidityInfo]);


    const cardStyle = {
        opacity: innerBlockState ? 1 : 0,
        transitionProperty: 'opacity, height, display',
        // overflow: 'auto',
        transitionDuration: innerBlockState ? '300ms' : '300ms',
        transitionTimingFunction: 'ease-out',
        height: innerBlockState ? liquidityInfo?.isPairNew ? '155px' : '45px' : '0px',
        marginTop: '0px', 
        border: boxWarning ?  warningState ? '1px solid #F0AB2D' : '1px solid #EB4768' : '1px solid gray' ,
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '10px' : '0px',
        borderBottomRightRadius: innerBlockState ? '10px' : '0px',
      };
    const boxStyle = {
        border: boxWarning ?  warningState ? '1px solid #F0AB2D' : '1px solid #EB4768' : '1px solid gray',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '0px' : '10px',
        borderBottomRightRadius: innerBlockState ? '0px' : '10px',
    };
    const contentStyle = {
        width: '100%',
        transitionProperty: 'opacity',
        transitionDuration: innerBlockState ? '2200ms' : '500ms',
        opacity: innerBlockState ? 1 : 0,
    };

    return (
        <>
            <Box display={'flex'} alignItems={'center'} justifyContent='space-between'  style={boxStyle}>
                { liquidityInfo && !isLoading ? (
                        <>
                            <Box alignItems={'center'}>
                            <Typography style={{marginLeft: '20px', display: liquidityInfo ? '' : 'none', fontSize:'13px'}} variant='body2' color='primary'>{token0Price} {token0Name} = {token1Price} {token1Name}</Typography>
                            </Box>
                            <Box alignItems={'center'}>
                                <Typography style={{marginLeft: '20px', display: liquidityInfo ? '' : 'none', maxWidth:'70px', overflow:'hidden', fontSize:'13px'}} variant='body2' color='primary'>LP: {lps}</Typography>
                            </Box>
                            <Box alignItems={'center'} justifyContent='space-between'>
                                <Button onClick={showHideInnerBlock} style={{borderRadius:'50px'}}>
                                    <KeyboardArrowDownIcon style={{fill:'#DAC0AA'}}></KeyboardArrowDownIcon>
                                </Button>
                            </Box>    
                         </>
                    ) : (
                        <>
                            <CircularProgress style={{marginLeft: '25px'}} size={25}></CircularProgress>
                        </>
                    )
                }

            </Box>
            <Container style={cardStyle} >
                <Box style={{alignItems:'center', justifyContent:'center', display:'flex', marginTop: '10px'}}  >
                <Grid container direction='row' spacing={1}  style={contentStyle} justifyContent='center'>
                    <Grid item xs={12} >
                        <Box display={'flex'} mt={0} flexDirection={'column'}>
                            <Box mr={1} ml={1} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Share of Pool</Typography>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: boxWarning ?  warningState ? '#F0AB2D' : '#EB4768' : 'lightgrey'}}>{shareOfPool}%</Typography>
                            </Box>
                            <Box mr={1} ml={1} mt={1} display={liquidityInfo?.isPairNew  ? 'flex' : 'none'} flexDirection={'column'} textAlign={'center'} justifyContent={'center'}>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>You are the first liquidity provider.</Typography>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>The ratio of tokens you add will set the price of this pool.</Typography>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: '#EB4768'}}>This Pair will have 80% tax unless its whitelisted by Based Labs.</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                </Box>
            </Container>
        </>

    );
}


export default LiquidityPoolShare;
