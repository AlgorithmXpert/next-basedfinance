import React, { useState } from 'react';
import {Button, Divider, Box, useMediaQuery} from '@material-ui/core';
import { useWallet } from 'use-wallet';
import useModal from '../../hooks/common/useModal';
import WalletProviderModal from '../WalletProviderModal';
import AccountModal from './AccountModal';
import ChartsModal from './ChartsModal';
import {makeStyles, useTheme} from "@material-ui/core/styles";


interface AccountButtonProps {
  text?: string;
}

const useStyles = makeStyles((theme) => ({
  btn__charts: {
    marginRight: '0',
    marginTop: '25px',
    marginBottom: '25px',
    [theme.breakpoints.up('md')]: {
      marginRight: '10px',
      marginTop: '0',
      marginBottom: '0',
    },
  },
}))

const AccountButton: React.FC<AccountButtonProps> = ({ text }) => {
  const classes = useStyles()
  const { account } = useWallet();
  const [onPresentAccountModal] = useModal(<AccountModal />);
  const [onPresentChartsModal] = useModal(<ChartsModal />);

  const [isWalletProviderOpen, setWalletProviderOpen] = useState(false);

  const handleWalletProviderOpen = () => {
    setWalletProviderOpen(true);
  };

  const handleWalletProviderClose = () => {
    setWalletProviderOpen(false);
  };

  const buttonText = text ? text : 'Connect';
  const theme = useTheme();
  const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isSemiMidSizeScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const truncate = (str: string, n: number) => {
		return str?.length > n ? str.substr(0, n - 1) + "..." + str.substr(str.length - n, n) : str;
	};

  return (
    <Box display={'flex'} flexDirection={isSmallSizeScreen || isSemiMidSizeScreen ? 'column' : 'row'}>
      {/* <Button className={classes.btn__charts} variant="contained" onClick={onPresentChartsModal} color={"secondary"}>
        Charts
      </Button> */}
      {!account ? (
        <Button onClick={handleWalletProviderOpen} color="secondary" variant="contained">
          {buttonText}
        </Button>
      ) : (
        <Button className="btn__wallet" variant="contained" onClick={onPresentAccountModal}  color={"secondary"}>
          {truncate(account, 6)}
        </Button>
      )}

      <WalletProviderModal open={isWalletProviderOpen} handleClose={handleWalletProviderClose} />
      {/* <AccountModal open={isAccountModalOpen} handleClose={handleAccountModalClose}/> */}
    </Box>
  );
};

export default AccountButton;
