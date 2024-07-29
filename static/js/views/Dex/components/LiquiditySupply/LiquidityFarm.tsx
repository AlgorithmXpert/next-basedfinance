import React, { useCallback, useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Container,
    useMediaQuery,
    Typography,
    Button
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { DexFarmInfo, DexLiquidityInfo } from '../../../../based-finance/types';

interface LiquidityFarmProps{
    children?: React.ReactNode;
    liquidityInfo: DexLiquidityInfo;
    isLoading: boolean;
}

const LiquidityFarm: React.FC<LiquidityFarmProps> = ({liquidityInfo, isLoading}) => {
    const [innerBlockState, setInnerBlockState] = useState(false);
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [farmInfo, setFarm] = useState<DexFarmInfo>();


    useEffect(() => {
        if(!liquidityInfo)
        {
            setFarm(undefined);
            return
        }
        // handleChangeTokenAsset(activeToken);
        setFarm(liquidityInfo.farms);
      }, [liquidityInfo])

    const showHideInnerBlock = useCallback(async () => {
        setInnerBlockState(!innerBlockState)
      }, [innerBlockState])

    const cardStyle = {
        opacity: innerBlockState ? 1 : 0,
        transitionProperty: 'opacity, height, display',
        // overflow: 'auto',
        transitionDuration: innerBlockState ? '600ms' : '500ms',
        transitionTimingFunction: 'ease-out',
        height: innerBlockState ?  '80px' : '0px',
        marginTop: '0px', 
        border: '1px solid gray' ,
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '10px' : '0px',
        borderBottomRightRadius: innerBlockState ? '10px' : '0px',
      };
    const boxStyle = {
        border: '1px solid grey',
        display:  farmInfo ? '' : 'none',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '0px' : '10px',
        borderBottomRightRadius: innerBlockState ? '0px' : '10px',
    };
    const contentStyle = {
        width: '100%',
        transitionProperty: 'opacity',
        transitionDuration: innerBlockState ? '1200ms' : '500ms',
        opacity: innerBlockState ? 1 : 0,
    };

    return (
        <>
            <Box display={'flex'} alignItems={'center'} justifyContent='space-between'  style={boxStyle}>
                <Box alignItems={'center'}>
                    <Typography style={{marginLeft: '20px'}} variant='body2' color='primary'>Farm found for this Pair!</Typography>
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
                            <Box mr={1} ml={1} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Farm by:</Typography>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{farmInfo?.by}</Typography>
                            </Box>
                            <Box mr={1} ml={1} mt={1} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    style={{maxHeight: '25px'}}
                                    /*disabled={approveStatus === ApprovalState.PENDING || approveStatus === ApprovalState.UNKNOWN}*/
                                    onClick={()=>{window.open(farmInfo?.farmUrl, '_blank', 'noopener,noreferrer')}}
                                >
                                    {`Go FARM!`}
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                </Box>
            </Container>
        </>

    );
}


export default LiquidityFarm;
