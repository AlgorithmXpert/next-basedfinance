import React from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {Container, Grid, Typography, Link, Box, useMediaQuery} from '@material-ui/core';
import TwitterImage from '../../assets/img/twitter.svg';
import GithubImage from '../../assets/img/github.svg';
import TelegramImage from '../../assets/img/telegram.svg';
import DiscordImage from '../../assets/img/discord.svg';
import AssureLogo from "../../assets/img/icons/assure.png";
import ObeliskLogo from "../../assets/img/icons/obelisk.png";
import {NavLink} from "react-router-dom";
import Spacer from "../Spacer";
//import YoutubeImage from '../../assets/img/youtube.svg';

const useStyles = makeStyles((theme) => ({
    footer: {
        position: 'absolute',
        bottom: '0',
        paddingTop: '15px',
        paddingBottom: '15px',
        width: '100%',
        color: 'white',
        backgroundColor: '#121212',
        textAlign: 'center',
        // height: '1.3rem',
        // [theme.breakpoints.down('xs')]: {
        //   display: 'none',
        // },
    },
    link: {
        width: '24px',
        height: '24px',
        display: 'inline',
        marginLeft: '20px',
    },

    img: {
        width: '24px',
        height: '24px',
    },
    linkButton: {
        textTransform: 'uppercase',
        // padding: '32px 0',
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
    linkButtonActive: {
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
}));

const Footer = () => {
    const classes = useStyles();
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const isSemiMidSizeScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <footer className={classes.footer} style={{
            paddingTop:   '16px',
            paddingBottom: '16px',
        }}>
            <Container maxWidth="lg" style={{bottom: '0'}}>
                <Grid container>
                    <Spacer size={ isSmallSizeScreen ? "sm" : 'none'}></Spacer>
                    <Grid item xs={12} sm={6}  style={{border: '0px solid blue'}}>
                        <Box display={'flex'} flexDirection={isSmallSizeScreen || isSemiMidSizeScreen ? 'column' : 'row'}
                             justifyContent={'flex-start'} alignItems={'center'} style={{height: '100%'}}>
                            <Typography variant="body2" color="textSecondary" style={{border: '0px solid blue'}}>
                                {'Copyright © '}
                                <Link color="inherit" href="/">
                                    Based Finance
                                </Link>{' '}
                                {new Date().getFullYear()}
                            </Typography>
                            {/* <Spacer size={ isSmallSizeScreen ? "md" : 'none'}></Spacer>
                            <Box mb={ isSmallSizeScreen ? 0 : 2} ml={'20px'} display={'flex'} flexDirection={'row'}
                                 justifyContent={'flex-start'} >
                                <a href="https://www.assuredefi.io/projects/based-finance/" target="_blank"
                                   rel="noopener noreferrer">
                                    <img
                                        alt="Assure logo"
                                        color="none"
                                        style={{
                                            zIndex: -1,
                                            maxWidth: '90px',
                                            height: 'auto',
                                        }}
                                        src={AssureLogo}
                                    />
                                </a>
                                <Spacer size={ isSmallSizeScreen ? "md" : 'none'}></Spacer>
                                <a href="https://obeliskauditing.com/audits/based" target="_blank"
                                   rel="noopener noreferrer">
                                    <img
                                        alt="Assure logo"
                                        color="none"
                                        style={{
                                            zIndex: -1,
                                            maxWidth: '90px',
                                            height: 'auto',
                                            paddingRight: '0px',
                                        }}
                                        src={ObeliskLogo}
                                    />
                                </a>
                            </Box> */}
                        </Box>
                    </Grid>
                    <Spacer size={ isSmallSizeScreen ? "md" : 'none'}></Spacer>
                    <Grid item xs={12} sm={4}  style={{border: '0px solid blue'}}>
                        <Box display={'flex'} flexDirection={'row'}
                             justifyContent={isSmallSizeScreen || isSemiMidSizeScreen ? 'center' : 'flex-end'} alignItems={'center'}
                             style={{height: '100%'}}>
                            <a color="textPrimary" href="https://basedfinance.gitbook.io/based-finance-v2/" target="blank" className={classes.linkButton}>
                                Docs
                            </a>
                            {/* <NavLink color="textPrimary" to="/metrics" className={classes.linkButton} activeClassName={classes.linkButtonActive}
                            style={{cursor: 'not-allowed', opacity:'0.3', pointerEvents: 'none'}}
                            >
                                Metrics
                            </NavLink> */}
                        </Box>
                    </Grid>
                    <Spacer size={ isSmallSizeScreen ? "md" : 'none'}></Spacer>
                    <Grid item xs={12} sm={2}  style={{border: '0px solid red'}}>
                        <Box display={'flex'} flexDirection={'row'}
                             justifyContent={isSmallSizeScreen || isSemiMidSizeScreen ? 'center' : 'flex-end'} alignItems={'center'}
                             style={{height: '100%'}} mb={isSmallSizeScreen ? 0 : 2}>
                            <a
                                href="https://twitter.com/BasedDEFI"
                                rel="noopener noreferrer"
                                target="_blank"
                                className={classes.link}
                                style={{marginLeft: '0px'}}
                            >
                                <img alt="twitter" src={TwitterImage} className={classes.img}/>
                            </a>
                            {/* <a
                                href="https://github.com/BasedFinance"
                                rel="noopener noreferrer"
                                target="_blank"
                                className={classes.link}
                                style={{ marginLeft: isSmallSizeScreen ? '50px' : '20px'}}
                            >
                                <img alt="github" src={GithubImage} className={classes.img}/>
                            </a> */}
                            {/* <a href="https://t.me/BasedFinanceio" rel="noopener noreferrer" target="_blank"
                               className={classes.link}
                               style={{ marginLeft: isSmallSizeScreen ? '50px' : '20px'}}
                            >
                                <img alt="telegram" src={TelegramImage} className={classes.img}/>
                            </a> */}
                            <a href="https://discord.gg/ZT3nzm84kW" rel="noopener noreferrer" target="_blank"
                               className={classes.link}
                               style={{ marginLeft: isSmallSizeScreen ? '50px' : '20px'}}
                            >
                                <img alt="discord" src={DiscordImage} className={classes.img}/>
                            </a>
                        </Box>
                    </Grid>
                    <Spacer size={ isSmallSizeScreen ? "sm" : 'none'}></Spacer>
                </Grid>
            </Container>
        </footer>
    );
};

export default Footer;
