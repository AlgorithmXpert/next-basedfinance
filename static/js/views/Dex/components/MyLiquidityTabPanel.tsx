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
import LiquidityPair from './MyLiquidity/LiquidityPair'
import ExchangeSlippage from './Dex/ExchangeSlippage'
import useDexGetTokensLength from '../../../hooks/dex/useDexGetTokensLength';
import useDexGetMyLiquidity from "../../../hooks/dex/useDexGetMyLiquidity";

interface MyLiquidityTabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: any;
    value: any;
    isLoading: boolean
    // nodeInfo: TwistedNodesInfo;
    // rewardTokenName: string;
    // handleChangeTokenAsset: (ticker: string) => void;
    showSupply: (token0: DexTokenInfo, token1: DexTokenInfo) => void
}


const MyLiquidityTabPanel: React.FC<MyLiquidityTabPanelProps> = (props: MyLiquidityTabPanelProps) => {
  const theme = useTheme();
  const basedFinance = useBasedFinance();
  const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const { children, value, index, isLoading, showSupply, ...other } = props;
  const [activeToken, setActiveToken] = React.useState(USDC_TICKER);
  const smeltStats = useSmeltStats();

  const [approveStatus, approve] = useNodesTokensApprove(SMELT_TICKER, "TWISTEDNODES");
  const needsApproval = approveStatus !== ApprovalState.APPROVED;


  const [modalApprovalState, setModalApprovalState] = useState(ApprovalState.UNKNOWN);

  const [selectedToken0, setSelectedToken0] = useState<DexTokenInfo>();
  const [selectedToken1, setSelectedToken1] = useState<DexTokenInfo>();

  const tokenBalance0 = useTokenBalance(selectedToken0?.address);
  const tokenBalance1 = useTokenBalance(selectedToken1?.address);

  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [loadingMyLiquidity, setLoadingMyLiquidity] = useState(false);

  const [valToken0, setValToken0] = useState('');
  const [valToken1, setValToken1] = useState('');
  const [slippage, setSlippage] = useState('10');
  const tokensLength = useDexGetTokensLength();

  const myLiquidityInfo = useDexGetMyLiquidity(isLoading, updateTrigger);


  useEffect(() => {
    if (modalApprovalState === ApprovalState.PENDING && approveStatus === ApprovalState.NOT_APPROVED) {
      setModalApprovalState(ApprovalState.APPROVED);
    } else {
    }
    setModalApprovalState(approveStatus);

  }, [approveStatus]);
  
  useEffect(() => {
    if(isLoading && value !== index)
      return;
      setUpdateTrigger(updateTrigger + 1);
}, [basedFinance.myAccount])

  useEffect(() => {
      setLoadingMyLiquidity(false);
  }, [myLiquidityInfo])


  useEffect(() => {
    if(isLoading)
      return;
    if( value === index ){
      setLoadingMyLiquidity(true);
      setUpdateTrigger(updateTrigger + 1);
    }
  }, [value, isLoading])

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
        <Grid container justifyContent={'center'} alignItems={'center'} >
            <Grid item xs={12}>
              <Typography style={{textAlign:'center', fontSize: '12px', margin: '5px'}} color={'primary'}>Don't see a pool you joined? 
Unstake your tokens from farms to see them here.</Typography>
            </Grid>
            {!isLoading && !loadingMyLiquidity ? (
              <>
                {myLiquidityInfo?.liquidityInfo
                    ?.map((token, index) => (
                        <React.Fragment key={token.token0.name}>
                          <Grid item xs={12}>
                            <LiquidityPair showSupply={showSupply} liquidityInfo={token}></LiquidityPair>
                          </Grid>
                        </React.Fragment>
                ))}
              </>

            ) :
            (
              <>
                  <CircularProgress size={26} />
              </>
            )
            }


        </Grid>
      </Box>
    )}
  </div>
  );
};

export default MyLiquidityTabPanel;
