import React from 'react';
import clsx from 'clsx';
import { Link, NavLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button
} from '@material-ui/core';

import ListItemLink from '../ListItemLink';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AccountButton from './AccountButton';

import ChartsModal from './ChartsModal';
import useModal from '../../hooks/common/useModal';


const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  appBar: {
    color: '#e0e3bd',
    'background-color': '#121212',
    // borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '10px',
  },
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
    'background-color': 'rgba(0,0,0,0.9)',
    color: 'white',
  },
  hide: {
    display: 'none',
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarTitle: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: '30px',
  },
  link: {
    textTransform: 'uppercase',
    padding: '0px 0',
    color: '#cbccc2',
    fontSize: '14px',
    margin: theme.spacing(1, 2),
    fontWeight: 200,
    fontFamily: ['"Poppins"', 'sans-serif'].join(','),
    textDecoration: 'none',
    transition: 'ease-in 250ms',
    '&:hover': {
      textDecoration: 'none',
      color: 'white',
      textShadow: '#FC0 1px 0 5px',
    },
  },
  linkActive: {
    textTransform: 'uppercase',
    color: '#cbccc2',
    fontWeight: 300,
    fontFamily: ['"Poppins"', 'sans-serif'].join(','),
    fontSize: '14px',
    margin: theme.spacing(1, 2),
    textDecoration: 'underline',
    textShadow: '#FFF 1px 0 1px',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  brandLink: {
    textDecoration: 'none',
    color: '#cbccc2',
    fontFamily: 'Cubic',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  linkDashboard: {
    textTransform: 'uppercase',
    padding: '32px 0',
    color: "#079FE6",
    fontSize: '18px',
    margin: theme.spacing(1, 2),
    fontWeight: 200,
    fontFamily: ['"Poppins"', 'sans-serif'].join(','),
    textDecoration: 'none',
    transition: 'ease-in 250ms',
    '&:hover': {
      textDecoration: 'none',
      color: 'white',
      textShadow: '#FC0 1px 0 5px',
    },
  },
  linkDashboardActive: {
    textTransform: 'uppercase',
    color: '#079FE6',
    fontWeight: 300,
    fontFamily: ['"Poppins"', 'sans-serif'].join(','),
    fontSize: '18px',
    margin: theme.spacing(1, 2),
    textDecoration: 'underline',
    textShadow: '#079FE6 1px 0 1px',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const Nav = () => {
  const matches = useMediaQuery('(min-width:900px)');
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [onPresentChartsModal] = useModal(<ChartsModal />);

  const handleChartsModal = () => {
    handleDrawerClose();
    onPresentChartsModal();
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <AppBar position="sticky" elevation={0} className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        {matches ? (
          <>
            <Box style={{ flexGrow: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={clsx(open && classes.hide)}
              >
                <MenuIcon />
            </IconButton>
{/* Side Menu Bar */}
<Drawer
              className={classes.drawer}
              onClose={handleDrawerClose}
              variant="temporary"
              anchor="left"
              open={open}
              classes={{
                paper: classes.drawerPaper,
              }}
              >
                <div>
                  <IconButton onClick={handleDrawerClose} style={{ color: 'white' }}>
                    {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                  </IconButton>
                </div>
             
              <List >
                <Divider/>

                <ListItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Typography variant="h4" noWrap style={{ fontFamily: 'Cubic' }}>
                      Based EXTRAS
                    </Typography>
                </ListItem>
                <Divider/> 

                <ListItemText>
                    <NavLink
                    color="textPrimary"
                    to="/exchange"
                    className={classes.link}
                    activeClassName={classes.linkActive}
                    >
                        OTC Engine
                    </NavLink>
                </ListItemText>
                <ListItemText>
                    <NavLink
                      color="textPrimary"
                      to="/twistednodes"
                      className={classes.link}
                      activeClassName={classes.linkActive}
                      >
                        Twisted Nodes
                    </NavLink>
                </ListItemText>
                <Divider/>

                <ListItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Typography variant="h4" noWrap style={{ fontFamily: 'Cubic' }}>
                        ACTIONS
                    </Typography>
                </ListItem>
                <Divider/>

                <ListItem style={{ display: 'flex'}}>
                    <Button color="secondary"  href={ 'https://next-gen.basedfinance.io/dex/swap/0x1539C63037D95f84A5981F96e43850d1451b6216' + "/" + "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"} variant="outlined"  disabled={false} style={{maxHeight: '26px', minWidth: '120px'}}>
                        Buy OBOL
                    </Button>
                </ListItem> 

                <ListItem style={{ display: 'flex'}}>
                    <Button color="secondary" href={ 'https://next-gen.basedfinance.io/dex/swap/0x141FaA507855E56396EAdBD25EC82656755CD61e' + "/" + "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"} variant="outlined"  disabled={false} style={{maxHeight: '26px', minWidth: '120px'}}>
                        Buy SMELT
                    </Button>
                </ListItem>
                
                <ListItem style={{ display: 'flex'}}>
                    <Button color="secondary" target="_blank" href="https://basedfinance.io/bridge" variant="outlined" disabled={false} style={{maxHeight: '26px', minWidth: '120px'}} >
                       Bridge
                    </Button>
                </ListItem>
                <Divider/>

                <ListItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Typography variant="h4" noWrap style={{ fontFamily: 'Cubic' }}>
                    Info
                  </Typography>
                </ListItem>
                <Divider/>
                <ListItem color='textPrimary' className={classes.link} style={{padding: '1px'}} >
                    <Button variant='outlined' color='primary' disabled={false} onClick={handleChartsModal} style={{maxHeight: '26px', minWidth: '120px'}}>
                        Charts
                    </Button>
                </ListItem>
                <ListItem color='textPrimary' className={classes.link} style={{padding: '1px'}} >
                    <Button variant='outlined' color='primary' disabled={false} href="https://info.basedfinance.io" style={{maxHeight: '26px', minWidth: '120px'}}>
                        Analytics
                    </Button>
                </ListItem>

              </List>
            </Drawer>
          

{/* Nav Bar Desktop */}
              <Typography display={'inline'} variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
                <Link to={"/"} color="primary" className={classes.brandLink}>
                    Based Finance
                </Link>
              </Typography>
            </Box>
            <Box mr={5} my={2} display={'flex'} flexDirection={"row"}>
            <ListItem style={{ display: 'flex'}}>
                    <Button color="secondary" href={"https://basedfinance.io"} variant="outlined"  disabled={false} style={{maxHeight: '26px', minWidth: '120px'}}>
                        Home
                    </Button>
                </ListItem>
                <ListItem style={{ display: 'flex'}}>
                    <Button color="secondary" href={"https://basedfinance.io/earn"} variant="outlined"  disabled={false} style={{maxHeight: '26px', minWidth: '120px'}}>
                        Earn
                    </Button>
                </ListItem>
                
              {/* <NavLink
                color="textPrimary"
                to="/dex" //exchange
                className={classes.link}
                activeClassName={classes.linkActive}

                // style={{cursor: 'not-allowed', opacity:'0.3', pointerEvents: 'none'}}
                >
                    Based Dex
              </NavLink> */}
            </Box>
            {/* <HomeActions/>
            <Spacer size='sm'/> */}
            <AccountButton text="Connect" />
          </>
  ) : (
          <>
{/* Phone view */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={clsx(open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap style={{ fontFamily: 'Cubic' }}>
                <Link to="/" className={classes.brandLink}>
                    Based Finance
                </Link>
            </Typography>
 
            <Drawer
              className={classes.drawer}
              onClose={handleDrawerClose}
              variant="temporary"
              anchor="left"
              open={open}
              classes={{paper: classes.drawerPaper,}}
              >
                  <div>
                      <IconButton onClick={handleDrawerClose} style={{ color: 'white' }}>
                          {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                              <ListItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <AccountButton text="Connect" />
                              </ListItem>
                      </IconButton>
                  </div>
              <Divider />
              <List>
              <ListItem color='textPrimary' className={classes.link} component='a' target ='blank' href="https://basedfinance.io/" style={{border:'0px solid red', padding: 1}}>
                    Home
                </ListItem>
                <ListItem color='textPrimary' className={classes.link} component='a' target ='blank' href="https://basedfinance.io/earn" style={{border:'0px solid red', padding: 1}}>
                    Earn
                </ListItem>
                <ListItemText>
                    <NavLink
                    color="textPrimary"
                    to="/exchange"
                    className={classes.link}
                    activeClassName={classes.linkActive}
                    >
                        OTC ENGINE
                    </NavLink>
                </ListItemText>

                <ListItemText>
                    <NavLink
                    color="textPrimary"
                    to="/twistednodes"
                    className={classes.link}
                    activeClassName={classes.linkActive}
                    >
                        Twisted Nodes
                    </NavLink>
                </ListItemText>
                <ListItem color='textPrimary' className={classes.link} component='a' target ='blank' href="https://basedfinance.io/nft/" style={{border:'0px solid red', padding: 1}}>
                    NFT Dashboard
                </ListItem>
                <Divider/>

                <ListItem style={{ display: 'flex'}}>
                    <Button color="primary" href={ 'https://next-gen.basedfinance.io/dex/swap/0x1539C63037D95f84A5981F96e43850d1451b6216' + "/" + "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"} variant="outlined"  disabled={false} style={{maxHeight: '26px', minWidth: '120px'}}>
                        Buy OBOL
                    </Button>
                </ListItem>  

                <ListItem style={{ display: 'flex'}}>
                    <Button color="primary" href={ 'https://next-gen.basedfinance.io/dex/swap/0x141FaA507855E56396EAdBD25EC82656755CD61e' + "/" + "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"} variant="outlined"  disabled={false} style={{maxHeight: '26px', minWidth: '120px'}}>
                        Buy SMELT
                    </Button>
                </ListItem>

                <ListItem style={{ display: 'flex'}}>
                    <Button color="primary" target="_blank" href="https://basedfinance.io/bridge" variant="outlined" disabled={false} style={{maxHeight: '26px', minWidth: '120px'}} >
                        BRIDGE
                    </Button>
                </ListItem>
                
                <Divider/>

                <ListItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Typography variant="h4" noWrap style={{ fontFamily: 'Cubic' }}>
                        Info
                    </Typography>
                </ListItem>
                
                <Divider/>

                {/* <ListItem color='textPrimary' className={classes.link} component='a' target ='blank' href="https://linktube.com/basedlabs/" style={{padding: '1px'}}>
                    LinkTube
                </ListItem>  */}

               

                <ListItem color='textPrimary' className={classes.link} style={{padding: '1px'}} >
                    <Button variant='outlined' color='primary' disabled={false} onClick={handleChartsModal} style={{maxHeight: '26px', minWidth: '120px'}}>
                        Charts
                    </Button>
                </ListItem>
                <ListItem color='textPrimary' className={classes.link} style={{padding: '1px'}} >
                    <Button variant='outlined' color='primary' disabled={false} href="https://info.basedfinance.io" style={{maxHeight: '26px', minWidth: '120px'}}>
                        Analytics
                    </Button>
                </ListItem>

              </List>
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Nav;
