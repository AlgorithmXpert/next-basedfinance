import React, { useCallback, useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Container,
    useMediaQuery,
    Typography,
    Button,
    CircularProgress,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

import useCatchError from '../../../../hooks/common/useCatchError';

import Spacer from '../../../../components/Spacer';
import LiquidityTokenCard from './LiquidityTokenCard';
import { DexLiquidityInfo, DexTokenInfo } from '../../../../based-finance/types';
import useDexGetRemoveLiquidityInfo from '../../../../hooks/dex/useDexGetRemoveLiquidityInfo'
import useApprove, { ApprovalState } from '../../../../hooks/common/useApprove';
import useBasedFinance from '../../../../hooks/classes/useBasedFinance';
import useDexRemoveLiquidity from '../../../../hooks/dex/useDexRemoveLiquidity'

interface LiquidityPairProps{
    children?: React.ReactNode;
    liquidityInfo: DexLiquidityInfo;
    showSupply: (token0: DexTokenInfo, token1: DexTokenInfo) => void
}

const LiquidityPair: React.FC<LiquidityPairProps> = ({liquidityInfo, showSupply}) => {
    const [innerBlockState, setInnerBlockState] = useState(false);
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [valToken, setValToken] = useState('');
    const tokenBalance = 0;
    const [maxSelected, setMaxSelected] = useState(false);

    const basedFinance = useBasedFinance();
    const removeLiqInfo = useDexGetRemoveLiquidityInfo(maxSelected ? liquidityInfo.lpAmount : Number(valToken), liquidityInfo);

    const catchError = useCatchError();

    const [modalApprovalStateToken0, setModalApprovalStateToken0] = useState(ApprovalState.UNKNOWN);
    // const [modalApprovalStateToken1, setModalApprovalStateToken1] = useState(ApprovalState.UNKNOWN);
  
    const [approveStatusToken0, approveToken0] = useApprove(liquidityInfo ? liquidityInfo?.lpContract : basedFinance.BASED, basedFinance.contracts["DEXRouter"].address); //DexRouter
  
    const needsApproval = approveStatusToken0 !== ApprovalState.APPROVED;
  
    const { onRemove } = useDexRemoveLiquidity(removeLiqInfo?.lpAmount, removeLiqInfo);

    useEffect(() => {
        if (modalApprovalStateToken0 === ApprovalState.PENDING && approveStatusToken0 === ApprovalState.NOT_APPROVED) {
          setModalApprovalStateToken0(ApprovalState.APPROVED);
        } else {
          setModalApprovalStateToken0(approveStatusToken0);
        }
      }, [approveStatusToken0]);

    //   useEffect(() => {
    //     if (modalApprovalStateToken1 === ApprovalState.PENDING && approveStatusToken1 === ApprovalState.NOT_APPROVED) {
    //       setModalApprovalStateToken1(ApprovalState.APPROVED);
    //     } else {
    //       setModalApprovalStateToken1(approveStatusToken1);
    //     }
    //   }, [approveStatusToken1]);

    const showHideInnerBlock = useCallback(async () => {
        setInnerBlockState(!innerBlockState)
      }, [innerBlockState])

      function isNumeric(n: any) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
    
      const handleChangeValue = async (e: any) => {
          setMaxSelected(false);
        if( e.currentTarget.value != "") {
            if (!isNumeric(e.currentTarget.value)) return;
          } 
        setValToken(e.currentTarget.value);
     };

     const handleSelectMaxToken = async () => {
         setMaxSelected(true);
         setValToken(liquidityInfo.lpAmount.toFixed(4));
      };
    
      const handleSelectHalfToken = async () => {
          setMaxSelected(false);
        setValToken((liquidityInfo.lpAmount / 2.0).toFixed(4));
      };

    const cardStyle = {
        opacity: innerBlockState ? 1 : 0,
        transitionProperty: 'opacity, height, display',
        // overflow: 'auto',
        transitionDuration: innerBlockState ? '300ms' : '300ms',
        transitionTimingFunction: 'ease-out',
        height: innerBlockState ?  '400px' : '0px',
        marginTop: '0px', 
        border: '1px solid gray' ,
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '10px' : '0px',
        borderBottomRightRadius: innerBlockState ? '10px' : '0px',
      };
    const boxStyle = {
        border: '1px solid grey',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '0px' : '10px',
        borderBottomRightRadius: innerBlockState ? '0px' : '10px',
    };
    const contentStyle = {
        width: '100%',
        transitionProperty: 'opacity',
        transitionDuration: innerBlockState ? '2200ms' : '300ms',
        opacity: innerBlockState ? 1 : 0,
    };

    return (
        <>
            <Box display={'flex'} alignItems={'center'} justifyContent='space-between'  style={boxStyle}>
                <Box alignItems={'center'}>
                    <Typography style={{marginLeft: '20px'}} variant='body2' color='primary'>{liquidityInfo.token0.name}-{liquidityInfo.token1.name}</Typography>
                </Box>
                <Box alignItems={'center'}>
                    <Typography style={{marginLeft: '20px'}} variant='body2' color='primary'>{liquidityInfo.lpAmount.toFixed(10)}</Typography>
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
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Pooled {liquidityInfo.token0.name}</Typography>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{liquidityInfo.token0Amount.substring(0,10)}</Typography>
                            </Box>
                            <Box mr={1} ml={1} mt={1} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                                <Typography variant='h5' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Pooled {liquidityInfo.token1.name}</Typography>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{liquidityInfo.token1Amount.substring(0,10)}</Typography>
                            </Box>
                            <Box mr={1} ml={1} mt={1} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                                <Typography variant='h5' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Share of Pool</Typography>
                                <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{liquidityInfo.shareOfPool}%</Typography>
                            </Box>
                            <Box mr={1} ml={1} mt={1} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    /*disabled={approveStatus === ApprovalState.PENDING || approveStatus === ApprovalState.UNKNOWN}*/
                                    onClick={()=>{ showSupply(liquidityInfo.token0, liquidityInfo.token1)}}
                                >
                                    {`SUPPLY`}
                                </Button>
                            </Box>
                            <Box mr={1} ml={1} mt={1} display={'flex'} alignItems={'center'} flexDirection={'column'} justifyContent={'center'} style={{border: '1px solid grey', borderRadius:'10px'}}>
                                <Spacer size={'sm'}/>
                                <Typography variant='h5' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>Remove liquidity</Typography>
                                <Spacer size={'sm'}/>
                                <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'} style={{zIndex: '1'}}>
                                    <LiquidityTokenCard
                                        name={liquidityInfo.token0.name+"-"+liquidityInfo.token1.name}
                                        onChange={handleChangeValue}
                                        value={valToken}
                                        onSelectMax={handleSelectMaxToken}
                                        onSelectHalf={handleSelectHalfToken}
                                        max={liquidityInfo.lpAmount.toFixed(4)}></LiquidityTokenCard>
                                    <Box mr={1} ml={1} mt={1} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                                        <Typography variant='h5' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{liquidityInfo.token0.name}</Typography>
                                        <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{removeLiqInfo?.token0Amount.substring(0,15)}</Typography>
                                    </Box>
                                    <Box mr={1} ml={1} mt={1} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                                        <Typography variant='h5' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{liquidityInfo.token1.name}</Typography>
                                        <Typography variant='body2' color='primary' style={{fontWeight: '100', fontSize: '14px', color: 'lightgrey'}}>{removeLiqInfo?.token1Amount.substring(0,15)}</Typography>
                                    </Box>
                                    <Box mr={1} ml={1} mt={1} mb={1} display={'flex'} justifyContent={'center'} style={{ width: '100%', border: '1px solid red'}}>
                                    {modalApprovalStateToken0   ?
                                        (() => {
                                        if (modalApprovalStateToken0 === ApprovalState.PENDING ) {
                                            return  (
                                                <Box display={'flex'} justifyContent={'center'} style={{width: '100%'}}>
                                                    <CircularProgress size={26} />
                                                </Box>
                                            )
                                        }
                                        if (modalApprovalStateToken0 === ApprovalState.APPROVED || !needsApproval) {
                                            return (
                                            <Button 
                                                color="secondary" 
                                                variant="contained"
                                                style={{maxHeight: '30px', margin: '5px'}}
                                                disabled={liquidityInfo.lpAmount < Number(valToken) ? true : false}
                                                onClick={onRemove}
                                                // disabled={rewardTokenName === 'REWARD' ? true : smeltBalance < nodeInfo?.price ? true : false}
                                                >
                                                {/* {smeltBalance < nodeInfo?.price ? 'Insufficient Balance' : 'Purchase'} */}
                                                { liquidityInfo.lpAmount < Number(valToken) ? "Insufficient Balance" : "Remove" }
                                            </Button>
                                            );
                                        } else if (modalApprovalStateToken0 === ApprovalState.NOT_APPROVED) {
                                            return (
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                style={{maxHeight: '30px', margin: '5px'}}
                                                /*disabled={approveStatus === ApprovalState.PENDING || approveStatus === ApprovalState.UNKNOWN}*/
                                                onClick={() => catchError(  approveToken0(), `Unable to approve ` + liquidityInfo?.token0.name + "-" + liquidityInfo.token1.name)}
                                            >
                                                { "Approve " + liquidityInfo?.token0.name + "-" + liquidityInfo.token1.name} 
                                            </Button>
                                            );
                                        } 
                                        // else if( modalApprovalStateToken1 === ApprovalState.NOT_APPROVED ){
                                        //     return(
                                        //     <Button
                                        //         variant="contained"
                                        //         color="secondary"
                                        //         style={{maxHeight: '30px', margin: '5px'}}
                                        //         /*disabled={approveStatus === ApprovalState.PENDING || approveStatus === ApprovalState.UNKNOWN}*/
                                        //         onClick={() => catchError( approveToken1(), `Unable to approve ` + + liquidityInfo?.token1.name)}
                                        //     >
                                        //         {"Approve " + liquidityInfo?.token1.name} 
                                        //     </Button>
                                        //     )
                                        // }
                                        }) : (
                                        <Button 
                                        color="secondary" 
                                        variant="contained"
                                        disabled={true}
                                        style={{maxHeight: '30px', margin: '5px'}}
                                        // onClick={onBuyTwistedNode}
                                        // disabled={rewardTokenName === 'REWARD' ? true : smeltBalance < nodeInfo?.price ? true : false}
                                        >
                                        {/* {smeltBalance < nodeInfo?.price ? 'Insufficient Balance' : 'Purchase'} */}
                                        <CircularProgress size={26} />
                                        </Button>
                                        )} 
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                </Box>
            </Container>
        </>

    );
}


export default LiquidityPair;
