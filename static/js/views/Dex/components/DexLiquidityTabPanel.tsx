import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Container,
    useMediaQuery,
    Typography,
    Button,
    Select,
    MenuItem,
    IconButton,
    CircularProgress
} from '@material-ui/core';
import useCatchError from '../../../hooks/common/useCatchError';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {useTheme} from "@material-ui/core/styles";
import useApprove, { ApprovalState } from '../../../hooks/common/useApprove';
import Spacer from '../../../components/Spacer';
import {USDC_TICKER, FTM_TICKER, WFTM_TICKER, SMELT_TICKER} from '../../../utils/constants';
import useSmeltStats from '../../../hooks/stats/useSmeltStats';
import useNodesTokensApprove from '../../../hooks/twistednodes/useNodesTokensApprove';
import useBasedFinance from '../../../hooks/classes/useBasedFinance'
import { getDisplayBalance } from '../../../utils/formatBalance';
import SelectTokenCard from './SelectTokenCard';
import SlippageInput from '../../../components/SlippageInput';
import useDexTokensInfo from '../../../hooks/dex/useDexTokensInfo'
import useTokenBalance from '../../../hooks/dex/useTokenBalance'
import { DexTokenInfo } from '../../../based-finance/types';
import LiquidityPoolShare from './LiquiditySupply/LiquidityPoolShare'
import LiquidityFarm from './LiquiditySupply/LiquidityFarm'
import ExchangeSlippage from './Dex/ExchangeSlippage'
import useDexGetTokensLength from '../../../hooks/dex/useDexGetTokensLength';
import useDexGetLiquidity from '../../../hooks/dex/useDexGetLiquidity';
//Icons
import PlusIcon from '../../../assets/img/icons_dex/plus.svg'
import useDexAddLiquidity from '../../../hooks/dex/useDexAddLiquidity';
import useDex from '../../../hooks/classes/useDex'
import useWallet from 'use-wallet';
import { load } from 'redux-localstorage-simple';
import { BigNumber, ethers } from 'ethers';


interface DexLiquidityProps {
    children?: React.ReactNode;
    dir?: string;
    index: any;
    value: any;
    dexTokensInfo: DexTokenInfo[];
    isLoading: boolean;
    token0?: DexTokenInfo;
    token1?: DexTokenInfo;
    parentValue: number;
    parentIndex: number;
    // nodeInfo: TwistedNodesInfo;
    // rewardTokenName: string;
    supplyShowed: () => void;
}


const DexLiquidityTabPanel: React.FC<DexLiquidityProps> = (props: DexLiquidityProps) => {
  const theme = useTheme();
  const basedFinance = useBasedFinance();
  const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const { children, value, index, dexTokensInfo, isLoading, token0, token1, supplyShowed, parentValue, parentIndex, ...other } = props;
  const [activeToken, setActiveToken] = React.useState(USDC_TICKER);
  const smeltStats = useSmeltStats();
  const dex = useDex();
  const { account, balance } = useWallet();

  const [selectedToken0, setSelectedToken0] = useState<DexTokenInfo>();
  const [selectedToken1, setSelectedToken1] = useState<DexTokenInfo>();

  let tokenBalance0 = useTokenBalance(selectedToken0?.address);
  let tokenBalance1 = useTokenBalance(selectedToken1?.address);

  tokenBalance0 = selectedToken0?.address === '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83' ? Number(balance) / 1e18 : tokenBalance0;
  tokenBalance1 = selectedToken1?.address === '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83' ? Number(balance) / 1e18 : tokenBalance1;
  
  const [amount, setAmount] = useState("");
  const [isFirstTokenValueChanged, setIsFirstTokenValueChanged] = useState(false);

  const [valToken0, setValToken0] = useState('');
  const [valToken1, setValToken1] = useState('0');
  const [slippage, setSlippage] = useState('2');
  const tokensLength = useDexGetTokensLength();

  const liquidityInfo = useDexGetLiquidity(selectedToken0, selectedToken1, amount,
      Number(slippage),isFirstTokenValueChanged, parentValue == parentIndex);


  const [modalApprovalStateToken0, setModalApprovalStateToken0] = useState(ApprovalState.UNKNOWN);
  const [modalApprovalStateToken1, setModalApprovalStateToken1] = useState(ApprovalState.UNKNOWN);

  const [approveStatusToken0, approveToken0] = useApprove(selectedToken0 ? selectedToken0?.contract : basedFinance.BASED, basedFinance.contracts["DEXRouter"].address); //DexRouter
  const [approveStatusToken1, approveToken1] = useApprove(selectedToken1 ? selectedToken1?.contract : basedFinance.BASED, basedFinance.contracts["DEXRouter"].address); //DexRouter

  let needsApproval =  approveStatusToken0 !== ApprovalState.APPROVED || approveStatusToken1 !== ApprovalState.APPROVED ;
  // const dexTokensInfo = useDexTokensInfo(tokensLength);

  const [isDataLoading, setIsDataLoading] = React.useState(true);

  const { onAddLiquidity } = useDexAddLiquidity(selectedToken0, selectedToken1, liquidityInfo?.isPairNew ? valToken0.toString() :  liquidityInfo?.token0Amount.toString() ,
  liquidityInfo?.isPairNew ? valToken1 : liquidityInfo?.token1Amount.toString(), liquidityInfo?.lpAmount, Number(slippage));

  const [loadAutoRoute, setLoadAutoRoute] = React.useState(true);


  useEffect(() => {
    if( !dexTokensInfo )
      return;
    // setSelectedToken0(dexTokensInfo[0]);
    // setSelectedToken1(dexTokensInfo[1]);
    setIsDataLoading(false);
  }, [dexTokensInfo]);



  useEffect(() => {
    if( !token0 || !token1 )
      return;
    setSelectedToken0(token0);
    setSelectedToken1(token1);
    supplyShowed();
  }, [token0, token1]);


  useEffect(() => {
    if (modalApprovalStateToken0 === ApprovalState.PENDING && approveStatusToken0 === ApprovalState.NOT_APPROVED) {
      setModalApprovalStateToken0(ApprovalState.APPROVED);
    } else {
      setModalApprovalStateToken0(approveStatusToken0);
    }
  }, [approveStatusToken0]);

  useEffect(() => {
    if (modalApprovalStateToken1 === ApprovalState.PENDING && approveStatusToken1 === ApprovalState.NOT_APPROVED) {
      setModalApprovalStateToken1(ApprovalState.APPROVED);
    } else {
      setModalApprovalStateToken1(approveStatusToken1);
    }
  }, [approveStatusToken1]);

  useEffect(() => {
    if( !liquidityInfo )
      return;
    // if( selectedToken0.address === '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'){
    //   setModalApprovalStateToken0(ApprovalState.APPROVED)
    // }
    // if( selectedToken1.address === '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'){
    //   setModalApprovalStateToken1(ApprovalState.APPROVED)
    // }
    if( isFirstTokenValueChanged ) {
      if( liquidityInfo.token0Amount != amount ){
        return;
      }
    } else {
      if( liquidityInfo.token1Amount != amount ){
        return;
      }
    }

    if(isFirstTokenValueChanged){
      if( liquidityInfo?.token1Amount ){
        console.log(liquidityInfo.token1Amount)
       // let token1Amount = ethers.utils.parseUnits(liquidityInfo.token1Amount, 18);
       // if( token1Amount.gt(0) ){
        if( liquidityInfo.token1Amount.length > 0)
          setValToken1(liquidityInfo.token1Amount.substring(0.10))
      //  }
      }

    }
    else {
      console.log(liquidityInfo.token0.contract.decimal)
      console.log(liquidityInfo.token0Amount)
     /// let token0Amount = ethers.utils.parseUnits(liquidityInfo.token0Amount, 18);

      //if( token0Amount.gt(0) 
      if( liquidityInfo.token0Amount.length > 0)
          setValToken0(liquidityInfo.token0Amount.substring(0.10))
    }
    setLoadAutoRoute(false);
  }, [liquidityInfo]);


//   const riskFreeValue = useMemo(
//     () => (smeltStats && nodeInfo ? Number(smeltStats.priceInDollars) * nodeInfo.price : null),
//     [smeltStats],
//   );

//   const { onBuyTwistedNode } = useBuyTwsitedNode(rewardTokenName, nodeInfo?.price, nodeInfo?.nodeName);


  const handleChangeToken = (event: any) => {
    const value = event.target.value;
    setActiveToken(value);
  };

  useEffect(() => {
    // handleChangeTokenAsset(activeToken);
  }, [activeToken])

  // //If we change tab we have to set same token
  // useEffect(() => {
  //   setActiveToken(selectedToken);
  // }, [selectedToken])

  const useStyles = makeStyles(theme => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120
    },
    selectEmpty: {
      marginTop: theme.spacing(2)
    },
    menuPaper: {
      maxHeight: 150
    }
  }));

  const classes = useStyles();
  const catchError = useCatchError();

  function isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  const handleSlippageChange = async (e: any) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setSlippage(String(100));
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setSlippage(e.currentTarget.value);
  };

  const handleChangeToken0 = async (e: any) => {
    setIsFirstTokenValueChanged(true);

    if( e.currentTarget.value != "") {
      if (!isNumeric(e.currentTarget.value)) return;
    } 
     setValToken0(e.currentTarget.value);
     if( Number(e.currentTarget.value) === 0 ){
      setValToken1("");
     }
     setAmount((e.currentTarget.value));
     setLoadAutoRoute(true)
  };

  const handleChangeToken1 = async (e: any) => {
    setIsFirstTokenValueChanged(false);

    if( e.currentTarget.value != "") {
      if (!isNumeric(e.currentTarget.value)) return;
    } 
    if( Number(e.currentTarget.value) === 0 ){
      setValToken0("");
     }
     setValToken1(e.currentTarget.value);
     setAmount((e.currentTarget.value));
     setLoadAutoRoute(true)
  };


  const handleChangeAssetToken0 = (token: DexTokenInfo) => {
    if( isDataLoading )
      return;
    setValToken0("");
    setValToken1("");
    setAmount("0");

    if( selectedToken0 ){
      if( token.address === selectedToken1.address ){
        setSelectedToken1(selectedToken0)
      }
      setSelectedToken0(token)
    }

  };

  useEffect(() => {
    if( !dex || !dexTokensInfo || dexTokensInfo.length === 0 )
      return;
    const a = document.createElement('a');
    const url = new URL(window.location.href);
    let res = url.pathname.split('/');
    if(res.length > 2){
      //Open add liquidity
      if( res.length > 4 ){

        //path: 0xf4Ac65Ac9dB0F16DCcB374D060C9675cF9Cb39Ff,0x0Fc87A290C16009b135f00325bcf204df2E7a3bF

        const tokenAddress0 = res[3]
        const tokenAddress1 = res[4]
        
        try{
          const token0 = dex.dexTokens[tokenAddress0];
          const token1 = dex.dexTokens[tokenAddress1];
          if( tokenAddress0 === tokenAddress1 ){
            setSelectedToken0(dexTokensInfo[0]);
            setSelectedToken1(dexTokensInfo[1]);
            return;
          }
          if( token0 && token1 ) {
                setSelectedToken0(token0);
                setSelectedToken1(token1)
                return;
          };

        }
        catch(error){

        }
      }
    }
    setSelectedToken0(dexTokensInfo[0]);
    setSelectedToken1(dexTokensInfo[1]);
  }, [window.location.href, dex, dexTokensInfo]);

  const handleChangeAssetToken1 = (token: DexTokenInfo) => {
    if( isDataLoading )
      return;
    setValToken1("");
    setValToken0("");
    setAmount("0");
    if( selectedToken0 ){
      if( token.address === selectedToken0.address ){
        setSelectedToken0(selectedToken1)
      }
      setSelectedToken1(token)
    }

  };

  const slippageChange = (slippage: number) => {
    setSlippage(slippage.toFixed(2));
  }


  const handleSelectMaxToken0 = async () => {
    setValToken0(tokenBalance0.toFixed(4));
    setAmount((tokenBalance0.toFixed()));
    setIsFirstTokenValueChanged(true);
    setLoadAutoRoute(true)
  };

  const handleSelectMaxToken1 = async () => {
    setValToken1(tokenBalance1.toFixed(4));
    setAmount((tokenBalance1.toFixed()));
    setIsFirstTokenValueChanged(false);
    setLoadAutoRoute(true)
  };
  const handleSelectHalfToken0 = async () => {
    setValToken0((tokenBalance0 / 2.0).toFixed(4));
    setAmount(Number(tokenBalance0 / 2.0).toFixed());
    setIsFirstTokenValueChanged(true);
    setLoadAutoRoute(true)
  };

  const handleSelectHalfToken1 = async () => {
    setValToken1((tokenBalance1 / 2.0).toFixed(4));
    setAmount(Number(tokenBalance1 / 2.0).toFixed());
    setIsFirstTokenValueChanged(false);
    setLoadAutoRoute(true)
  };

  return (
    <div
    role="tabpanel"
    hidden={value !== index}
    id={`full-width-tabpanel-${index}`}
    aria-labelledby={`full-width-tab-${index}`}
    style={{border: '0px solid blue', display: 'flex'}}
    {...other}
    >
    {value === index && (
      <Box display={'flex'} justifyContent='center'>
        <Grid container justifyContent={'center'} alignItems={'center'} style={{pointerEvents: isLoading ? 'none' : 'all'}}>
            <Spacer size={'sm'}/>     
            <Grid item xs={12}>
              <Box  display={'flex'} justifyContent={'center'} style={{opacity: isLoading ? '0.6' : '1.0'}}>
                <SelectTokenCard
                    onChange={handleChangeToken0}
                    value={valToken0}
                    currentToken={selectedToken0}
                    tokens={dexTokensInfo}
                    handleChangeAsset={handleChangeAssetToken0}
                    onSelectMax={handleSelectMaxToken0}
                    onSelectHalf={handleSelectHalfToken0}
                    max={tokenBalance0?.toFixed(4)}
                />
                </Box>
            </Grid>
            <Box display={'flex'} zIndex={isLoading ? 1 : 0} mb={-1} mt={-1} alignItems={'center'} justifyContent={'center'}
             style={{ maxWidth: '35px', maxHeight: '30px', borderRadius: '8px',
              border: '1px solid #DAC0AA', backgroundColor: "rgba(32, 32, 42, 0.95)",opacity: isLoading ? '0.8' : '1.0'}}>
              <IconButton disabled={true}>
                <img src={PlusIcon} width={'auto'} height={15}></img>
              </IconButton>
            </Box>  
            <Grid item xs={12} style={{pointerEvents: isLoading ? 'none' : 'all'}}>
              <Box display={'flex'}  justifyContent={'center'} style={{opacity: isLoading ? '0.6' : '1.0'}}>
                <SelectTokenCard
                    onChange={handleChangeToken1}
                    value={valToken1}
                    currentToken={selectedToken1}
                    tokens={dexTokensInfo}
                    handleChangeAsset={handleChangeAssetToken1}
                    onSelectMax={handleSelectMaxToken1}
                    onSelectHalf={handleSelectHalfToken1}
                    max={tokenBalance1?.toFixed(4)}
                />
              </Box>
            </Grid>
            <Grid item xs={6} >
              <Box display={'flex'} flexDirection={'column'} textAlign={'right'}>
                <Spacer size={'sm'}/>     
              </Box>
            </Grid>
            <Grid item xs={12}>
              <LiquidityPoolShare isLoading={loadAutoRoute} liquidityInfo={liquidityInfo}></LiquidityPoolShare>
            </Grid>
            <Spacer size={'sm'}/>     
            <Grid item xs={12}>
              <ExchangeSlippage slippageChange={slippageChange}></ExchangeSlippage>
            </Grid>
            <Spacer size={'sm'}/>     
            <Grid item xs={12} >
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} style={{width: '100%'}}>
                  {modalApprovalStateToken0 && modalApprovalStateToken1 && !isLoading ?
                    (() => {
                      if (modalApprovalStateToken0 === ApprovalState.PENDING || modalApprovalStateToken1 === ApprovalState.PENDING) {
                        return  (
                          <Box display={'flex'} justifyContent={'center'} style={{width: '100%'}}>
                              <CircularProgress size={26} />
                          </Box>
                      )
                      }
                      if( selectedToken0?.address != '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83' && selectedToken1?.address != '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'){
                        if ((modalApprovalStateToken0 === ApprovalState.APPROVED && modalApprovalStateToken1 === ApprovalState.APPROVED) || !needsApproval) {
                          return (
                            <Button 
                              color="secondary" 
                              variant="contained"
                              style={{width: '100%'}} 
                              onClick={onAddLiquidity}
                              disabled={loadAutoRoute}
                              // disabled={rewardTokenName === 'REWARD' ? true : smeltBalance < nodeInfo?.price ? true : false}
                              >
                              {/* {smeltBalance < nodeInfo?.price ? 'Insufficient Balance' : 'Purchase'} */}
                              Let's go
                            </Button>
                          );
                        } else if (modalApprovalStateToken0 === ApprovalState.NOT_APPROVED) {
                          return (
                            <Button
                              variant="contained"
                              color="secondary"
                              style={{width: '100%'}} 
                              onClick={() => catchError(approveToken0() , `Unable to approve ` + selectedToken0?.name)}
                            >
                              {"Approve " + selectedToken0?.name} 
                            </Button>
                          );
                        } else if (modalApprovalStateToken1 === ApprovalState.NOT_APPROVED) {
                          return (
                            <Button
                              variant="contained"
                              color="secondary"
                              style={{width: '100%'}} 
                              onClick={() => catchError(approveToken1() , `Unable to approve ` + selectedToken1?.name)}
                            >
                              {"Approve " + selectedToken1?.name} 
                            </Button>
                          );
                        }
                      } else {
                        if( selectedToken0?.address == '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83' ){
                          if ((modalApprovalStateToken1 === ApprovalState.APPROVED || approveStatusToken1 === ApprovalState.APPROVED) ) {
                            return (
                              <Button 
                                color="secondary" 
                                variant="contained"
                                style={{width: '100%'}} 
                                onClick={onAddLiquidity}
                                disabled={loadAutoRoute}

                                // disabled={rewardTokenName === 'REWARD' ? true : smeltBalance < nodeInfo?.price ? true : false}
                                >
                                {/* {smeltBalance < nodeInfo?.price ? 'Insufficient Balance' : 'Purchase'} */}
                                Let's go
                              </Button>
                            );
                          } else if (modalApprovalStateToken1 === ApprovalState.NOT_APPROVED) {
                            return (
                              <Button
                                variant="contained"
                                color="secondary"
                                style={{width: '100%'}} 
                                onClick={() => catchError(approveToken1() , `Unable to approve ` + selectedToken1?.name)}
                              >
                                {"Approve " + selectedToken1?.name} 
                              </Button>
                            );
                          }
                        }else if( selectedToken1?.address == '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83' ){
                          if ((modalApprovalStateToken0 === ApprovalState.APPROVED || approveStatusToken0 === ApprovalState.APPROVED) ) {
                            return (
                              <Button 
                                color="secondary" 
                                variant="contained"
                                style={{width: '100%'}} 
                                onClick={onAddLiquidity}
                                // disabled={rewardTokenName === 'REWARD' ? true : smeltBalance < nodeInfo?.price ? true : false}
                                >
                                {/* {smeltBalance < nodeInfo?.price ? 'Insufficient Balance' : 'Purchase'} */}
                                Let's go
                              </Button>
                            );
                          } else if (modalApprovalStateToken0 === ApprovalState.NOT_APPROVED) {
                            return (
                              <Button
                                variant="contained"
                                color="secondary"
                                style={{width: '100%'}} 
                                onClick={() => catchError(approveToken0() , `Unable to approve ` + selectedToken0?.name)}
                              >
                                {"Approve " + selectedToken0?.name} 
                              </Button>
                            );
                          }
                        }
                      } 
                    }) : (
                      <Button 
                      color="secondary" 
                      variant="contained"
                      disabled={true}
                      style={{width: '100%', display: account ? '' : 'none'}} 
                      // onClick={onBuyTwistedNode}
                      // disabled={rewardTokenName === 'REWARD' ? true : smeltBalance < nodeInfo?.price ? true : false}
                      >
                      {/* {smeltBalance < nodeInfo?.price ? 'Insufficient Balance' : 'Purchase'} */}
                      <CircularProgress size={26} />
                    </Button>
                    )} 
                </Box>
            </Grid>

            <Spacer size={'sm'}/>     
            <Grid item xs={12}>
              <Typography style={{textAlign:'center', fontSize: '12px', margin: '5px'}} color={'primary'}>By adding liquidity you'll earn 0.1% of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.</Typography>
            </Grid>
            <Spacer size={'sm'}/>     
            <Grid item xs={12}>
              <LiquidityFarm isLoading={loadAutoRoute} liquidityInfo={liquidityInfo}></LiquidityFarm>
            </Grid>
        </Grid>
      </Box>
    )}
  </div>
  );
};

export default DexLiquidityTabPanel;
