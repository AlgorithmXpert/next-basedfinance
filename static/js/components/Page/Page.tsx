import React from 'react';
import {Container, useMediaQuery} from '@material-ui/core';
import useEagerConnect from '../../hooks/common/useEagerConnect';

import Footer from '../Footer';
import Nav from '../Nav';
import {useTheme} from "@material-ui/core/styles";

const Page: React.FC = ({children}) => {
    useEagerConnect();
    const theme = useTheme();
    const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));
    return (
        <div style={{position: 'relative', minHeight: '100vh'}}>
            <Nav/>
            <Container maxWidth="lg" style={{paddingBottom: isSmallSizeScreen ? '16rem' : '7rem'}}>
                {children}
            </Container>
            <Footer/>
        </div>
    );
};

export default Page;
