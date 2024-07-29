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
    CircularProgress,
    IconButton
} from '@material-ui/core';
import useCatchError from '../../../hooks/common/useCatchError';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {useTheme} from "@material-ui/core/styles";
import Spacer from '../../../components/Spacer';
import {USDC_TICKER, FTM_TICKER, WFTM_TICKER, SMELT_TICKER} from '../../../utils/constants';

import { getDisplayBalance } from '../../../utils/formatBalance';
import SelectTokenCard from './SelectTokenCard';
import SlippageInput from '../../../components/SlippageInput';

//Hooks
import useApprove, { ApprovalState } from '../../../hooks/common/useApprove';
import useSmeltStats from '../../../hooks/stats/useSmeltStats';
import useNodesTokensApprove from '../../../hooks/twistednodes/useNodesTokensApprove';
import useBasedFinance from '../../../hooks/classes/useBasedFinance'
import useDexTokensInfo from '../../../hooks/dex/useDexTokensInfo'
import useTokenBalance from '../../../hooks/dex/useTokenBalance'
import useGetAutoRoute from '../../../hooks/dex/useGetAutoRoute';
import useDex from '../../../hooks/classes/useDex';
//Test
import useDexTest from '../../../hooks/dex/useDexTest';

//Windows
import ExchangeDropDown from './Dex/ExchangeDropDown'
import ExchageAutoRoute from './Dex/ExchangeAutoRoute'
import ExchangeSlippage from './Dex/ExchangeSlippage'
//Icons
import SwapIcon from '../../../assets/img/icons_dex/swap2.svg'
import useGetSwapInfo from '../../../hooks/dex/useGetSwapInfo';
import useDexGetTokensLength from '../../../hooks/dex/useDexGetTokensLength';
import useDexGetPairs from '../../../hooks/dex/useDexGetPairs';
import { DexTokenInfo } from '../../../based-finance';
import { DexDiscountTable, DexSwapInfo, DexUserDiscount } from '../../../based-finance/types';
// import { DexTokenInfo } from '../../../based-finance';
import useDexSwap from '../../../hooks/dex/useDexSwap'
import useWallet from 'use-wallet';
import AccountButton from '../../../components/Nav/AccountButton';

interface ExchangeTabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: any;
    value: any;
    dexTokensInfo: DexTokenInfo[];
    isLoading: boolean;
    setSwapInfo: (swapInfo: DexSwapInfo) => void;
    // nodeInfo: TwistedNodesInfo;
    // rewardTokenName: string;
    // handleChangeTokenAsset: (ticker: string) => void;
}


const ExchangeTabPanel: React.FC<ExchangeTabPanelProps> = (props: ExchangeTabPanelProps) => {
  const { children, value, index, dexTokensInfo, isLoading, setSwapInfo, ...other } = props;
  const theme = useTheme();
  const basedFinance = useBasedFinance();
  const dex = useDex();
  const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const [activeToken, setActiveToken] = React.useState(USDC_TICKER);
  const { account } = useWallet();

 // const tokensLength = useDexGetPairs();
  const [tokensLen, setTokensLen] = useState(0);

  //const dexTokensInfo = useDexTokensInfo(tokensLength);
  
  const [amount, setAmount] = useState("0");
  const [selectedToken0, setSelectedToken0] = useState<DexTokenInfo>();
  const [selectedToken1, setSelectedToken1] = useState<DexTokenInfo>();
  const [slippage, setSlippage] = useState('2');
  const [isFirstTokenValueChanged, setIsFirstTokenValueChanged] = useState(false);
  const [resetDataOnSwapTokens, setResetDataOnSwapToken] = useState(false);
  const swapInfo = useGetSwapInfo(selectedToken0, selectedToken1, amount, Number(slippage),isFirstTokenValueChanged, value== index);
  const { onSwap } = useDexSwap(swapInfo, amount);

  let tokenBalance0 = useTokenBalance(selectedToken0?.address);
  let tokenBalance1 = useTokenBalance(selectedToken1?.address);

  const { balance } = useWallet();

  tokenBalance0 = selectedToken0?.address === '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83' ? Number(balance) / 1e18 : tokenBalance0;
  tokenBalance1 = selectedToken1?.address === '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83' ? Number(balance) / 1e18 : tokenBalance1;

  const [valToken0, setValToken0] = useState('');
  const [valToken1, setValToken1] = useState('');


  const [loadAutoRoute, setLoadAutoRoute] = React.useState(true);
  const autoRoute = useGetAutoRoute( selectedToken0, selectedToken1, Number(valToken0));


  const {onTest} = useDexTest();

  const [modalApprovalStateToken0, setModalApprovalStateToken0] = useState(ApprovalState.UNKNOWN);
  const [modalApprovalStateToken1, setModalApprovalStateToken1] = useState(ApprovalState.UNKNOWN);

  const [approveStatusToken0, approveToken0] = useApprove(selectedToken0 ? selectedToken0.contract : basedFinance.BASED, basedFinance.contracts["DEXRouter"].address); //DexRouter
  // const [approveStatusToken1, approveToken1] = useApprove(selectedToken1 ? selectedToken1?.contract : basedFinance.BASED, basedFinance.contracts["DEXRouter"].address); //DexRouter

  const needsApproval = approveStatusToken0 !== ApprovalState.APPROVED ; // approveStatusToken1 !== ApprovalState.APPROVED

  useEffect(() => {
    if (modalApprovalStateToken0 === ApprovalState.PENDING && approveStatusToken0 === ApprovalState.NOT_APPROVED) {
      setModalApprovalStateToken0(ApprovalState.APPROVED);
    } else {
      setModalApprovalStateToken0(approveStatusToken0);
    }

  }, [approveStatusToken0]);

  useEffect(() => {
    if( !dex || !dexTokensInfo || dexTokensInfo.length === 0 )
      return;
    const a = document.createElement('a');
    const url = new URL(window.location.href);
    let res = url.pathname.split('/');
    if(res.length > 2){
      console.log(res[2])
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

  useEffect(() => {
    if(isLoading && value !== index)
      return;
    setValToken0("")
    setValToken1("")
    setAmount("0")
    setSwapInfo(undefined)
}, [basedFinance.myAccount])

  useEffect(() => {
    if( !dexTokensInfo )
      return;
    // setSelectedToken0(dexTokensInfo[0]);
    // setSelectedToken1(dexTokensInfo[1]);
  }, [dexTokensInfo]);

  useEffect(() => {
    if( !autoRoute )
      return;
    //setLoadAutoRoute(false)
  }, [autoRoute]);

  const handleChangeToken = (event: any) => {
    const value = event.target.value;
    console.log(value)
    setActiveToken(value);
  };

  useEffect(() => {
    // handleChangeTokenAsset(activeToken);
  }, [activeToken])

  useEffect(() => {
      if(!swapInfo)
        return
      if( swapInfo.amountInput != amount ){
        return;
      }
      if( swapInfo.isMainTokenChanged ){
        
        if( swapInfo.swapAmount === "0" ){
          setValToken1("");
        }
        else
          setValToken1(swapInfo.swapAmount)
      }
      else {
        if( swapInfo.swapAmount === "0" )
          setValToken0("");
        else
          setValToken0(swapInfo.swapAmount)
      }
      setLoadAutoRoute(false)
      setSwapInfo(swapInfo);

  }, [swapInfo])

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
    if( e.currentTarget.value != "") {
      if (!isNumeric(e.currentTarget.value)) return;
    } 
     setValToken0(e.currentTarget.value);
     if( Number(e.currentTarget.value)  === 0 ){
      setValToken1("");
     }
     setLoadAutoRoute(true)
     setIsFirstTokenValueChanged(true);
     setAmount((e.currentTarget.value));
  };

  const handleChangeToken1 = async (e: any) => {
    if( e.currentTarget.value != "") {
      if (!isNumeric(e.currentTarget.value)) return;
    } 
     setValToken1(e.currentTarget.value);
     setIsFirstTokenValueChanged(false);
     setLoadAutoRoute(true)
     setAmount((e.currentTarget.value));
  };

  const slippageChange = (slippage: number) => {
    setSlippage(slippage.toFixed(2));
    setLoadAutoRoute(true)
  }

  const rotateTokensClicked = () => {
    const selected0 = selectedToken0;
    setValToken0("");
    setValToken1("");
    setAmount("0");
    setSelectedToken0(selectedToken1);
    setSelectedToken1(selected0);
    setSwapInfo(undefined);
  }

  const handleChangeAssetToken0 = (token: DexTokenInfo) => {
    if(isLoading)
      return;
    setValToken0("");
    setValToken1("");
    setAmount("0");
    setSwapInfo(undefined);

    setResetDataOnSwapToken(!resetDataOnSwapTokens);

    if(swapInfo){
      swapInfo.buyTax = 0;
      swapInfo.slippage = 10;
      swapInfo.discount = 0;
      swapInfo.isTaxed = false;
    }

    if( selectedToken0 && selectedToken1 ){
      if( token.address === selectedToken1?.address ){
        setSelectedToken1(selectedToken0)
      }
      else if( token.address !== selectedToken0?.address )
        setLoadAutoRoute(true);
  
      setSelectedToken0(token)
    }
  };

  const handleChangeAssetToken1 = (token: DexTokenInfo) => {
    if(isLoading)
      return;
    setValToken1("");
    setValToken0("");
    setAmount("0");
    setSwapInfo(undefined);

    if(swapInfo){
      swapInfo.buyTax = 0;
      // swapInfo.slippage = 10;
      swapInfo.discount = 0;
    }
    setResetDataOnSwapToken(!resetDataOnSwapTokens);
    
    if( selectedToken0 && selectedToken1 ){
      if( token.address === selectedToken0.address ){
        setSelectedToken0(selectedToken1)
      }
      else if( token.address !== selectedToken1.address )
        setLoadAutoRoute(true)
      setSelectedToken1(token)
    }

  };


  const handleSelectMaxToken0 = async () => {
    setValToken0(tokenBalance0.toFixed(4));
    setAmount(tokenBalance0.toString());
    setIsFirstTokenValueChanged(true);
    if(tokenBalance0 == 0 ){
      setValToken1("");
      setValToken0("");
    }else{
      setLoadAutoRoute(true)
    }
  };

  const handleSelectMaxToken1 = async () => {
    setValToken1(tokenBalance1.toFixed(4));
    setAmount(tokenBalance1.toString());
    setIsFirstTokenValueChanged(false);
    if(tokenBalance1 == 0 ){
      setValToken1("");
      setValToken0("");
    }
    else
      setLoadAutoRoute(true)
  };
  const handleSelectHalfToken0 = async () => {
    setValToken0((tokenBalance0 / 2.0).toFixed(4));
    setAmount((tokenBalance0 / 2.0).toString());
    setIsFirstTokenValueChanged(true);
    if(tokenBalance0 == 0 ){
      setValToken1("");
      setValToken0("");
    } else
      setLoadAutoRoute(true)

  };

  const handleSelectHalfToken1 = async () => {
    setValToken1((tokenBalance1 / 2.0).toFixed(4));
    setAmount((tokenBalance1 / 2.0).toString());
    setIsFirstTokenValueChanged(false);
    if(tokenBalance1 == 0 ){
      setValToken1("");
      setValToken0("");
    } 
    else
      setLoadAutoRoute(true)


  };

  return (
    <div
    role="tabpanel"
    hidden={value !== index}
    id={`full-width-tabpanel-${index}`}
    aria-labelledby={`full-width-tab-${index}`}
    style={{display: 'flex', 
    backgroundColor: 'rgba(32, 32, 43, 0.75)' ,
    borderRadius: 20,
    border: '1px solid #DAC0AA',
    padding: 15 }}
    {...other}
    >
    { (
      <Box display={'flex'} justifyContent='center' style={{position: 'relative', pointerEvents: isLoading ? 'none' : 'all'}}>
        <Grid container justifyContent={'center'} alignItems={'center'} >
            <Spacer size={'sm'}/>     
            <Grid item xs={12} >
              <Box  display={'flex'} justifyContent={'center'} style={{opacity: isLoading ? '0.6' : '1.0'}}>
                <SelectTokenCard
                    onChange={handleChangeToken0}
                    value={valToken0.substring(0, 15)}
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
              <IconButton onClick={rotateTokensClicked}>
                <img src={SwapIcon} width={'auto'} height={25}></img>
              </IconButton>
            </Box>     
            <Grid item xs={12} >
              <Box display={'flex'}  justifyContent={'center'} style={{opacity: isLoading ? '0.6' : '1.0'}}>
                <SelectTokenCard
                    onChange={handleChangeToken1}
                    value={valToken1.substring(0, 15)}
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
              <ExchangeDropDown hidden={Number(amount) > 0 ? false : true} swapInfo={swapInfo} isLoading={loadAutoRoute}></ExchangeDropDown>
            </Grid>

            <Spacer size={'sm'}/>     
            <Grid item xs={12} style={{opacity: isLoading ? '0.6' : '1.0'}}>
              <ExchangeSlippage reset={resetDataOnSwapTokens} hidden={false} swapInfo={swapInfo} slippageChange={slippageChange}></ExchangeSlippage>
            </Grid>
            <Spacer size={'sm'}/>     
            <Grid item xs={12} >
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} style={{width: '100%'}}>
                  {modalApprovalStateToken0  && !isLoading ?
                    (() => {
                      if (modalApprovalStateToken0 === ApprovalState.PENDING ) {
                        return  (
                          <Box display={'flex'} justifyContent={'center'} style={{width: '100%'}}>
                              <CircularProgress size={26} />
                          </Box>
                      )
                      }
                      if( selectedToken0?.address == '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'){
                        return (
                          <Button 
                            color="secondary" 
                            variant="contained"
                            style={{width: '100%'}}
                            disabled={loadAutoRoute} 
                            onClick={onSwap}
                            // disabled={rewardTokenName === 'REWARD' ? true : smeltBalance < nodeInfo?.price ? true : false}
                            >
                            {/* {smeltBalance < nodeInfo?.price ? 'Insufficient Balance' : 'Purchase'} */}
                            Swap
                          </Button>
                        );
                      }else if ((modalApprovalStateToken0 === ApprovalState.APPROVED ) || !needsApproval) {
                        return (
                          <Button 
                            color="secondary" 
                            variant="contained"
                            style={{width: '100%'}} 
                            disabled={loadAutoRoute} 
                            onClick={onSwap}
                            // disabled={ tokenBalance0 < swapInfo?.swapAmount ? true : false}
                            >
                            {/* {smeltBalance < nodeInfo?.price ? 'Insufficient Balance' : 'Purchase'} */}
                            Swap
                          </Button>
                        );
                      } else if (modalApprovalStateToken0 === ApprovalState.NOT_APPROVED) {
                        return (
                          <Button
                            variant="contained"
                            color="secondary"
                            style={{width: '100%'}} 
                            /*disabled={approveStatus === ApprovalState.PENDING || approveStatus === ApprovalState.UNKNOWN}*/
                            onClick={() => catchError(  approveToken0(), `Unable to approve ` + selectedToken0?.name)}
                          >
                            { "Approve " + selectedToken0?.name } 
                          </Button>
                        );
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
                <Box display={'flex'} justifyContent={'center'}>
                { !account && 
                        <>
                            <AccountButton></AccountButton>
                        </>
                    }
                </Box>

            </Grid>
            <Spacer size={'sm'}/>     
            <Grid item xs={12}>
              <ExchageAutoRoute hidden={Number(amount) > 0 ? false : true} isLoading={false} autoRoute={swapInfo?.route}></ExchageAutoRoute>
            </Grid>
        </Grid>
      </Box>
    ) }
  </div>
  );
};

export default ExchangeTabPanel;
