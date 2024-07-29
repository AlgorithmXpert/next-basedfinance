import React, { useCallback, useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Container,
    useMediaQuery,
    Typography,
    Button,
    Input,TextField
} from '@material-ui/core';
import styled from 'styled-components';

import { useTheme } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SlippageInput from '../../../../components/SlippageInput';
import TokenInput from '../SelectTokenCard/TonekInput';
import { DexSwapInfo } from '../../../../based-finance/types';

interface ExchangeSlippageProps{
    children?: React.ReactNode;
    swapInfo?: DexSwapInfo;
    hidden?: boolean;
    reset? : boolean;
    slippageChange: (slippage: number) => void;
}

const ExchangeSlippage: React.FC<ExchangeSlippageProps> = ({children, swapInfo, hidden=false, reset = false, slippageChange}) => {
    const [innerBlockState, setInnerBlockState] = useState(false);
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [slippage, setSlippage] = useState('2');
    const [discount, setDiscount] = useState(0);

    const [value, setValue] = useState('');
    const [boxWarning, setBoxWarning] = useState(false);
    const [warningText, setWarningText] = useState('Transaction may be frontrun');
    const [warningState, setWarningState] = useState(0); //0 - bad state 1 - good state

    useEffect(() => {

      if(!swapInfo)
        return; 
      // if( swapInfo.discount > 0 ){
      //   //setSlippage((swapInfo.slippage - swapInfo.discount).toFixed(1));
      //   setWarningText("You have discount: " + swapInfo.discount.toFixed(1) + "%!" );
      //   setBoxWarning(true)
      //   setWarningState(1);
      // }
      // else {
      //   //setSlippage((swapInfo.slippage).toFixed(1));
      //   setWarningState(0);
      //   setBoxWarning(false)
      //   setDiscount(0);
      // }
      // setInnerBlockState(false)
      setDiscount(swapInfo.discount);
    }, [swapInfo, reset])

    const showHideInnerBlock = useCallback(async () => {
        setInnerBlockState(!innerBlockState)
      }, [innerBlockState]) 

      const handleChange = async (e: any) => {
        setValue(e.currentTarget.value);
     };
   
      function isNumeric(n: any) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }

      const handleSlippageChange = async (e: any) => {
        if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
          setSlippage('');
          if( e.currentTarget.value <= 0 ){
            setWarningText("Slippage percentage must be between 0 and 50.");
            setBoxWarning(true)
            setWarningState(0);
          }
          return;
        }

        if (!isNumeric(e.currentTarget.value)) return;
        setBoxWarning(false)

        
        // if(swapInfo && swapInfo.discount > 0 ){
        //   setWarningText("You have discount: " + swapInfo.discount.toFixed(1) + "%!" );
        //   setBoxWarning(true)
        //   setWarningState(1);
        // }
        


        if( e.currentTarget.value > 9 ){
          setWarningText("Transaction may be frontrun");
          setBoxWarning(true)
          setWarningState(0);
        }
        if( e.currentTarget.value <= 0 ){
          setWarningText("Slippage percentage must be between 0 and 50.");
          setBoxWarning(true)
          setWarningState(0);
        }

        // if( swapInfo &&  swapInfo.isTaxed ){
        //   if( (swapInfo.sellTax - swapInfo.discount) > Number(e.currentTarget.value) ){
        //     setWarningText("Transaction may fail. Your slippage is lower than tax.");
        //     setBoxWarning(true);
        //     setWarningState(0);

        //   }
        // }
        setSlippage(e.currentTarget.value);
        slippageChange(Number(e.currentTarget.value))
      };

    const cardStyle = {
        opacity: innerBlockState ? 1 : 0,
        transitionProperty: 'opacity, height, display',
        // overflow: 'auto',
        transitionDuration: innerBlockState ? '300ms' : '300ms',
        transitionTimingFunction: 'ease-out',
        height: innerBlockState ? boxWarning ? '80px' : '55px' : '0px',
        marginTop: '0px', 
        border: boxWarning ?  warningState ? '1px solid #14F08F' : '1px solid #EB4768' : '1px solid gray' ,
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '10px' : '0px',
        borderBottomRightRadius: innerBlockState ? '10px' : '0px',
      };
    const boxStyle = {
        border: boxWarning ?  warningState ? '1px solid #14F08F' : '1px solid #EB4768' : '1px solid gray' ,
        height: '40px',
        borderRadius: '10px',
        backgroundColor: 'rgba(32, 32, 42, 0.75)',
        borderBottomLeftRadius: innerBlockState ? '0px' : '10px',
        borderBottomRightRadius: innerBlockState ? '0px' : '10px',
    };
    const contentStyle = {
        width: '100%',
        transitionProperty: 'opacity',
        transitionDuration: innerBlockState ? '2200ms' : '200ms',
        opacity: innerBlockState ? 1 : 0,
    };

    return (
        <>
            <Box display={'flex'} alignItems={'center'} justifyContent='space-between'  style={boxStyle}>
                <Box alignItems={'center'}>
                    <Typography style={{marginLeft: '20px'}} variant='body2' color='primary'>Slippage</Typography>
                </Box>
                <Box display={'flex'} alignItems={'center'} flexDirection="row" justifyContent='space-between'>
                    <Typography style={{marginLeft: '20px'}} variant='body2' color='primary'>{!slippage ? '0' : slippage }%</Typography>
                    <Button onClick={showHideInnerBlock} style={{borderRadius:'50px'}}>
                        <KeyboardArrowDownIcon style={{fill:'#DAC0AA'}}></KeyboardArrowDownIcon>
                    </Button>
                </Box>
            </Box>
            <Container style={cardStyle} >
                <Box style={{alignItems:'center', justifyContent:'center', display:'flex', marginTop: '10px'}}  >
                <Grid container direction='row' spacing={2} justifyContent='center'  style={{
                    width: '100%' ,
                    borderRadius: '20px',
                    // overflow: 'auto',
                    display: 'flex' }} >
                    <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} mt={1} flexDirection={'row'} style={contentStyle}>
                        <Box  style={{border: '0px solid red'}}>
                            <SlippageInput isArray={true} slippageTypes={["0.1", "0.5", "1.0"]} fontSize={14} onChange={handleSlippageChange} value={slippage} />
                        </Box>
                        <Box display={'flex'} justifyContent={'flex-end'}  alignItems={'center'} style={{border: boxWarning ? warningState ? '1px solid #14F08F' : '1px solid #EB4768' : '1px solid grey',
                         maxHeight: '28px',  maxWidth: '70px', borderRadius: '5px'}}>
                                <TextField
                                style={{marginTop: '5px', marginBottom: '5px', alignItems:'center', fontSize: '14px'}}
                                id="align"
                                value={slippage}
                                type={'string'}
                                variant="standard"
                                placeholder='0'
                                defaultValue={''}
                                helperText={false}
                                onChange={handleSlippageChange}
                                size='small'
                                
                                InputProps={{ disableUnderline: true
                                  
                                 }}
                                inputProps={{
                                    style: { textAlign: "right", height: '10px', border: '0px solid red', marginTop: '4px', marginRight: '2px', alignItems:'center', fontSize:'14px' }
                                    , autoComplete: false
                                }}
                                />
                                <Typography color='primary' style={{marginRight:'5px'}}>%</Typography>
                        </Box>
                    </Box>
                    <Box display={boxWarning ? 'flex' : 'none'} mt={1}>
                      <Typography color='primary' style={{fontSize: '12px', color: warningState ? '#14F08F' : '#EB4768'}}>{warningText}</Typography>
                    </Box>
                </Grid>
                </Box>
            </Container>
        </>
    );
}

const StyledInputWrapper = styled.div`
  align-items: center;
  background-color: rgba(32, 32, 43, 0.0);
  border-radius: 5px;
  border:   0px solid white;
  display: flex;
  padding: 0 ${(props) => props.theme.spacing[3]}px;
  '&:focus': {
    border: 0px solid black !important;
  },
`;
const StyledInput = styled.input`
  background: none;
  font-size: 17px;
  text-align: right;
  outline: none;
  color: 'white';
  border: 1px solid green;
  width: '100%'
  flex: 1
`;


export default ExchangeSlippage;
