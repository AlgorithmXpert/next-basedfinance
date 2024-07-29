import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    useMediaQuery,
    Tab,
    Tabs
} from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {useTheme} from "@material-ui/core/styles";


interface NodeProps {
    handleBarChange: (event: React.ChangeEvent<{}>, newValue: number) => void
    value: number
    nodesCount?: number[],
    firstTitle?: string,
    secondTitle?: string
  }

const DexTabBar: React.FC<NodeProps> = ({handleBarChange, value, firstTitle="Exchange", secondTitle="Liquidity", nodesCount}) => {
  const theme = useTheme();
  const isSmallSizeScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const styles = {
    tab: {
        minWidth: 140,
        minHeight: isSmallSizeScreen ? 40 : 30,
        height: 10,
        marginTop: isSmallSizeScreen ? 2 : 4,
        marginBottom: isSmallSizeScreen ? 10 : 4,
        marginLeft: isSmallSizeScreen ? 10 : 2,
        marginRight: 2,
    },
    menuPaper: {
      maxHeight: 10
    }
  };

  function a11yProps(index: number) {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }
  
  return (
        <StyledTabs
        value={value}
        onChange={handleBarChange}
        centered={true}
        aria-label="basic tabs example"
        TabIndicatorProps={{
            style:{ display: 'none', color: 'red'},
        }}
        >
            <StyledTab style={styles.tab} label={firstTitle} {...a11yProps(0)} />
            <StyledTab style={styles.tab} label={secondTitle}  {...a11yProps(1)} />           
        </StyledTabs>
  );
};

const StyledTabs = withStyles({
    root: {
      background: "light-blue",
      maxWidth: '100%',
      alignItems: 'center',
      "& .MuiTab-root": { 
        border: '1px solid #DAC0AA',
        opacity: '0.4',
        backgroundColor: "rgba(32, 32, 42, 0.75)",
      },
      "& .MuiTab-root.Mui-selected": {
        color: '#DAC0AA',
        opacity: '1.0',
        border: '1px solid #DAC0AA',
      },
      "& .MuiTab-root.Mui-hover": {
        color: '#DAC0AA',
        opacity: '1.0',
        border: '1px solid #DAC0AA',
      },
      "& div.MuiTabs-scroller": {
        "& .MuiTabs-flexContainer": {
          flexWrap: "wrap",
          color: '#DAC0AA',
          border: '0px solid red',
          background: ""
        }
      }
    },
  })(Tabs);
  
  const StyledTab = withStyles({
    root: {
      background: "#DAC0AA",
      maxWidth: "10px",
      borderRadius: '10px',
      width:'10px',
      "&:hover": {
        opacity: 1
      },
    }
  })(Tab);

export default DexTabBar;
