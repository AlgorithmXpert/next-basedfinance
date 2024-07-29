import React, {useMemo} from 'react';
import styled from 'styled-components';
import useTokenBalance from '../../hooks/common/useTokenBalance';
import {getDisplayBalance} from '../../utils/formatBalance';

import Label from '../Label';
import Modal, {ModalProps} from '../Modal';
import ModalTitle from '../ModalTitle';
import useBasedFinance from '../../hooks/classes/useBasedFinance';
import TokenSymbol from '../TokenSymbol';
import {Typography, withStyles} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const AccountModal: React.FC<ModalProps> = ({onDismiss}) => {
    const basedFinance = useBasedFinance();

    const basedBalance = useTokenBalance(basedFinance.OBOL);
    const displayBasedBalance = useMemo(() => getDisplayBalance(basedBalance, 18, 2, false),
        [basedBalance]);

    const bshareBalance = useTokenBalance(basedFinance.SMELT);
    const displayBshareBalance = useMemo(() => getDisplayBalance(bshareBalance, 18, 2, false),
        [bshareBalance]);

    const GodNft = useTokenBalance(basedFinance.getTokenFromExternal('GodNft'));
    const GodNftBalance = useMemo(() => getDisplayBalance(GodNft, 18, 2, false),
        [GodNft]);

    const GodFootprint = useTokenBalance(basedFinance.getTokenFromExternal('GodFootprint'));
    const GodFootprintBalance = useMemo(() => getDisplayBalance(GodFootprint, 18, 2, false),
        [GodFootprint]);

    const ObolFtmReceipt = useTokenBalance(basedFinance.getTokenFromExternal('ObolFtmReceipt'));
    const ObolFtmReceiptBalance = useMemo(() => getDisplayBalance(ObolFtmReceipt, 18, 2, false),
        [ObolFtmReceipt]);
        
    const SmeltFtmReceipt = useTokenBalance(basedFinance.getTokenFromExternal('SmeltFtmReceipt'));
    const SmeltFtmReceiptBalance = useMemo(() => getDisplayBalance(SmeltFtmReceipt, 18, 2, false),
        [SmeltFtmReceipt]);
            

    // 'GodFootprint' : ['0xBe9E38E6e3386D67e1b7A3754dc39a8cd8b82b08', 18],
    // 'ObolFtmReceipt' : ['0x4ef20669E38751E4a585638d12dCFc6FF3635Dd1', 18],
    // 'SmeltFtmReceipt' : ['0x2733C1DAa3891E7c9Cdf9bC2aCAD74Aa78578B3b', 18],

    return (
        <Modal border={true}>
            <StyledCloseIcon
                onClick={onDismiss}
            />
            <ModalTitle text="My Wallet Balance:"/>

            <Balances>
                <StyledBalanceWrapper style={{minWidth: '120px', minHeight: '100px'}}>
                    <TokenSymbol size={60} symbol="OBOL_SIMPLE"/>
                    <StyledBalance style={{marginTop: '18px', marginBottom: '18px', fontSize: '0.75rem'}}>
                        <StyledValue>{displayBasedBalance}</StyledValue>
                        <Typography  variant={'h6'} color={'primary'}>OBOL</Typography>
                    </StyledBalance>
                </StyledBalanceWrapper>

                <StyledBalanceWrapper style={{minWidth: '120px'}}>
                    <TokenSymbol size={60} symbol="SMELT_SIMPLE"/>
                    <StyledBalance style={{marginTop: '18px', marginBottom: '18px', fontSize: '0.75rem'}}>
                        <StyledValue>{displayBshareBalance}</StyledValue>
                        <Typography variant={'h6'} color={'primary'}>SMELT</Typography>
                    </StyledBalance>
                </StyledBalanceWrapper>
                <StyledBalanceWrapper style={{minWidth: '120px'}}>
                    <TokenSymbol size={47} symbol="GodNft"/>
                    <StyledBalance style={{marginTop: '18px', marginBottom: '18px', fontSize: '0.75rem'}}>
                        <StyledValue>{GodNftBalance}</StyledValue>
                        <Typography variant={'h6'} color={'primary'}>GodNFT</Typography>
                    </StyledBalance>
                </StyledBalanceWrapper>
                <StyledBalanceWrapper style={{minWidth: '120px'}}>
                    <TokenSymbol size={60} symbol="GODFOOTPRINTS"/>
                    <StyledBalance style={{marginTop: '18px', marginBottom: '18px', fontSize: '0.75rem'}}>
                        <StyledValue>{GodFootprintBalance}</StyledValue>
                        <Typography variant={'h6'} color={'primary'}>GODsFootprint</Typography>
                    </StyledBalance>
                </StyledBalanceWrapper>
                <StyledBalanceWrapper style={{minWidth: '120px'}}>
                    <TokenSymbol size={60} symbol="OBOLFTMFOOTPRINTS"/>
                    <StyledBalance style={{marginTop: '18px', marginBottom: '18px', fontSize: '0.75rem'}}>
                        <StyledValue>{ObolFtmReceiptBalance}</StyledValue>
                        <Typography variant={'h6'} color={'primary'}>ObolFtmReceipt</Typography>
                    </StyledBalance>
                </StyledBalanceWrapper>
                <StyledBalanceWrapper style={{minWidth: '120px'}}>
                    <TokenSymbol size={60} symbol="SMELTFTMFOOTPRINTS"/>
                    <StyledBalance style={{marginTop: '18px', marginBottom: '18px', fontSize: '0.75rem'}}>
                        <StyledValue>{SmeltFtmReceiptBalance}</StyledValue>
                        <Typography variant={'h6'} color={'primary'}>SmeltFtmReceipt</Typography>
                    </StyledBalance>
                </StyledBalanceWrapper>
            </Balances>
            {/* <Balances>
                <StyledBalanceWrapper>
                    <TokenSymbol symbol="OBOL"/>
                    <StyledBalance style={{marginTop: '18px', marginBottom: '18px', fontSize: '0.75rem'}}>
                        <StyledValue>{displayBasedBalance}</StyledValue>
                        <Typography variant={'h6'} color={'primary'}>OBOL Available</Typography>
                    </StyledBalance>
                </StyledBalanceWrapper>

                <StyledBalanceWrapper>
                    <TokenSymbol symbol="SMELT"/>
                    <StyledBalance style={{marginTop: '18px', marginBottom: '18px', fontSize: '0.75rem'}}>
                        <StyledValue>{displayBshareBalance}</StyledValue>
                        <Typography variant={'h6'} color={'primary'}>SMELT Available</Typography>
                    </StyledBalance>
                </StyledBalanceWrapper>

                <StyledBalanceWrapper>
                    <TokenSymbol symbol="BBOND"/>
                    <StyledBalance style={{marginTop: '18px', marginBottom: '18px', fontSize: '0.75rem'}}>
                        <StyledValue>{displayBbondBalance}</StyledValue>
                        <Typography variant={'h6'} color={'primary'}>BBOND Available</Typography>
                    </StyledBalance>
                </StyledBalanceWrapper>
            </Balances> */}
        </Modal>
    );
};

const StyledValue = styled.div`
  color: ${(props) => props.theme.color.grey[300]};
  font-size: 20px;
  font-weight: 700;
`;

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const Balances = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`;

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 0 ${(props) => props.theme.spacing[3]}px;
`;

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
export default AccountModal;
