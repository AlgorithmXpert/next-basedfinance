import React, {useCallback, useEffect, useState} from 'react';

import {Button, Box, Typography, Grid} from '@material-ui/core';
import Modal, {ModalProps} from '../../../../components/Modal';
import ModalActions from '../../../../components/ModalActions';
import ModalTitle from '../../../../components/ModalTitle';
// import TokenInput from '../../../../components/TokenInput';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import styled from 'styled-components';

import {getBalance, getDisplayBalance, getFullDisplayBalance} from '../../../../utils/formatBalance';
import {BigNumber} from 'ethers';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {useTheme} from "@material-ui/core/styles";

import CloseIcon from "@material-ui/icons/Close";
import { DexDiscountTable, DexDiscountTableInfo, DexTokenInfo } from '../../../../based-finance/types';
import DiscountTableRow from './DiscountTableRow'

import useDex from '../../../../hooks/classes/useDex';
import useGetDiscountTableInfo from '../../../../hooks/dex/useGetDiscountTableInfo'

interface DiscountTableProps extends ModalProps {
   discountTable: DexDiscountTable[][];
}

const DiscountTableModal: React.FC<DiscountTableProps> = ({onDismiss, children, discountTable }) => {

    const dex = useDex();
    const [discountTableInfo, setDiscountTableInfo] = useState<DexDiscountTableInfo[]>([]);
    let dexTokensDiscount: { [address: string]: DexDiscountTable } = {};
    const [tableHeader, setTableHeader] = useState([]);
      const useStyles = makeStyles(theme => ({
        buttonColor: {
          border: '1px solid grey',
          '&.Mui-selected': {
            color: 'red',
        },
        }
      }));
    
      const classes = useStyles();
      useEffect(() => {
        dexTokensDiscount = {};
        let discountTableInfo: DexDiscountTableInfo[] = [];
        if( !discountTable )
            return;
        if( !discountTable.length )
          return;

        for( let i = 0; i < discountTable.length; i++ ){
            for(let k = 0; k < discountTable[i].length; k++ ){
                const discTable = discountTable[i][k];
                dexTokensDiscount[discTable.tokenAddress] = discTable;
            }
        }

        setTableHeader([]);
        try{
            for (var key in dexTokensDiscount) {
                if (dexTokensDiscount.hasOwnProperty(key)) {
                  //this.dexTokensInfo.push(this.dexTokens[key]);
                  //"Holding / Amount", "< 100", "100 - 500", "> 500"
                  //if( tableHeader.length === 0) {
                    let header = ["Holding / Amount"];
                    for( let i = 0; i < dexTokensDiscount[key].amounts.length; i++ ){
                        if( i === 0 )
                            header.push(">= " + getBalance(dexTokensDiscount[key].amounts[i], 18).toString())
                        else if( i === 1 )
                            header.push(">= " + getBalance(dexTokensDiscount[key].amounts[i], 18).toString())
                        else if ( i === 2 )
                            header.push(">= " + getBalance(dexTokensDiscount[key].amounts[i], 18).toString())
                     }
                     setTableHeader(header)
                  //}
    
                  if( !dex.dexTokens[dexTokensDiscount[key].tokenAddress] )
                     continue;
                  let row: DexDiscountTableInfo = {tokenName: dex.dexTokens[dexTokensDiscount[key].tokenAddress].name, discounts:[], header: header};
    
                  for( let i = 0; i < dexTokensDiscount[key].discounts.length; i++ ){
                        row.discounts.push(Number(dexTokensDiscount[key].discounts[i]) / 100)
                    }
                    discountTableInfo.push(row);
                }
              }
              setDiscountTableInfo(discountTableInfo);

        }
        catch(error){
            console.log(error)
        }

        }, [discountTable]);

    return (
        <Modal>
            <StyledCloseIcon
                onClick={onDismiss}
            />
            <ModalTitle text={`Discount Table for Current Route`}/>
            <Box display={'flex'} style={{ overflow:'auto'}}>
                <Box display={'flex'} flexDirection={'column'} style={{height: '100%', marginLeft: '5px', marginRight: '5px', width: '100%', minWidth: '480px', border: '0px solid grey'}}>

                    {discountTableInfo
                        ?.map((token, index) => (
                            <React.Fragment key={token.tokenName}>
                                <DiscountTableRow tableRows={token.header}/>
                                <DiscountTableRow tableRows={[token.tokenName, token?.discounts[0].toString()+"%",
                            token?.discounts[1].toString()+"%", token?.discounts.length > 1 ?  token?.discounts[2].toString()+"%" : '']}/>
                            </React.Fragment>
                    ))}
                </Box>
            </Box>
        </Modal>
    );
};

const CustomToggle = styled(ToggleButton)({
    color: "red"
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

export default DiscountTableModal;
