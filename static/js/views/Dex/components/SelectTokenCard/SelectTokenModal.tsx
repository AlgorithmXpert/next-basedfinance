import React, {useCallback, useEffect, useState} from 'react';

import {Button, Box, Typography, useMediaQuery} from '@material-ui/core';
import Modal, {ModalProps} from '../../../../components/Modal';
import ModalTitle from '../../../../components/ModalTitle';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import styled from 'styled-components';

import { withStyles, makeStyles,useTheme } from '@material-ui/core/styles';

import CloseIcon from "@material-ui/icons/Close";
import TokenItem from "./TokenItem"
import TokenInputSearch from './TokenInputSearch';
import { DexTokenInfo } from '../../../../based-finance/types';

interface SelectTokenModalProps extends ModalProps {
    token: DexTokenInfo
    tokens: DexTokenInfo[]
    handleSelectedToken?: (token: DexTokenInfo) => void;
}

const SelectTokenModal: React.FC<SelectTokenModalProps> = ({token, tokens, handleSelectedToken, onDismiss, children }) => {
    const [selectedToken, setSelectedToken] = useState(token);
    const [valToken0, setValToken0] = useState('');
    const [formats, setFormats] = React.useState(() => ['all']);
    const [searchType, setSearchType] = useState(0); //0 - name , 1 - address
    const [filterTokensType, setFilterTokens] = useState(2); //0 - NO TAX, 1 - TAX, 2 - ALL,
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));
    
    const handleFormat = (event: React.MouseEvent<HTMLElement>, newFormats: string[]) => {
        if (newFormats.length) {
          setFormats(newFormats);
          if( newFormats.length > 2 || newFormats.length <= 1 ){
            setFilterTokens(2);
          }else if ( newFormats.length > 0 ) {
            if(newFormats[1] === 'tax')
                setFilterTokens(1);
            else 
                setFilterTokens(0);
          }
        }
      };

    const handleChangeToken1 = async (e: any) => {
        setValToken0(e.currentTarget.value);

        if( e.currentTarget.value.length > 2 ){
            if(e.currentTarget.value[0] === '0' && e.currentTarget.value[1] === 'x'){
                setSearchType(1);
            }else
                setSearchType(0);
        }
      };

      const selectTaxTokens = (event: any) => {
        const value = event.target.value;
        console.log(value)
      };


      const useStyles = makeStyles(theme => ({
        buttonColor: {
          border: '1px solid grey',
          color: 'grey',
          '&.Mui-selected': {
            color: '#DAC0AA',
        },
        }
      }));
    
      const classes = useStyles();
    

    return (
        <Modal border={true}>
            <StyledCloseIcon
                onClick={onDismiss}
            />
            <ModalTitle text={`Select Token`}/>
            <Box style={{height: '100%', border: '0px solid blue'}}>
                <Box  style={{ maxHeight: '450px', border: '0px solid red'}}>
                    <Box mb={2} style={{border: '1px solid grey', borderRadius: '15px'}}>
                        <TokenInputSearch         
                            onChange={handleChangeToken1} 
                            placeholder="Search token or token address"
                            value={valToken0}>
                        </TokenInputSearch>
                    </Box>
                    <Box style={{overflow:'auto', maxHeight: isSmallSizeScreen ? '300px' : '350px', border: '0px solid red'}}>
                        <Box display={'flex'} flexDirection={'column'} style={{maxHeight: '400px', minHeight: '200px', border: '0px solid red'}}>
                                {tokens
                                    ?.filter(token => searchType === 0 ? token.name.includes(valToken0.toUpperCase()) : true)
                                    ?.filter(token => searchType === 1 ? token.address.includes(valToken0) : true)
                                    ?.filter((token) => token.name !== 'TOMB' && token.name !== 'USDC' )
                                    ?.filter((token) => filterTokensType != 2 ? token.isTaxed === Boolean(filterTokensType) : true )
                                    ?.map((token) => (
                                        <React.Fragment key={token.name}>
                                            <TokenItem tokenName={token.name} tokenSymbol={token.symbol} tokenInfo={token} selected={selectedToken.address === token.address ? true : false} handleTokeItemSelect={handleSelectedToken}></TokenItem>
                                        </React.Fragment>
                                ))}
                                {tokens
                                    ?.filter((token) =>  token.name === 'USDC' )
                                    ?.map((token) => (
                                        <React.Fragment key={token.name}>
                                            <TokenItem tokenName={token.name} tokenSymbol={token.symbol} tokenInfo={token} selected={selectedToken.address === token.address ? true : false} handleTokeItemSelect={handleSelectedToken}></TokenItem>
                                        </React.Fragment>
                                ))}
                                {tokens
                                    ?.filter((token) => token.name === 'TOMB' )
                                    ?.map((token) => (
                                        <React.Fragment key={token.name}>
                                            <TokenItem tokenName={token.name} tokenSymbol={token.symbol} tokenInfo={token} selected={selectedToken.address === token.address ? true : false} handleTokeItemSelect={handleSelectedToken}></TokenItem>
                                        </React.Fragment>
                                ))}
                        </Box>
                    </Box>
                    {/* <Box mt={2} display={'flex'} justifyContent={'center'}>
                        <ToggleButtonGroup value={formats} onChange={handleFormat} aria-label="device">
                            <CustomToggle className={classes.buttonColor} value="tax" aria-label="tax">
                                Tax Tokens
                            </CustomToggle>
                            <CustomToggle className={classes.buttonColor} value="no_tax" aria-label="no_tax">
                                No Tax Tokens
                            </CustomToggle>
                        </ToggleButtonGroup>
                    </Box> */}
                </Box>
            </Box>
        </Modal>
    );
};

const CustomToggle = styled(ToggleButton)({
    // color: "red"
  })

const StyledCloseIcon = withStyles({
    root: {
        position: 'absolute',
        right: '5px',
        top: '5px',
        padding: '10px',
        cursor: 'pointer',
        transition: '0.3s ease-in-out',
        color: '#fff',
        '&:hover': {
            color: '#a97c50',
            transition: '0.3s ease-in-out'
        }
    },
})(CloseIcon);

export default SelectTokenModal;
