//Your theme for the new stuff using material UI has been copied here so it doesn't conflict
import { createTheme } from '@material-ui/core/styles';

const newTheme = createTheme({
  palette: {
    type: 'dark',
    text: {
      primary: '#ffffff',
    },
    primary: {
      main: '#ffffff',
    },
    secondary: {
      light: '#ffffff',
      main: '#8a7865',
      dark: '#bdaa99',
      contrastText: '#ffffff',
    },
    action: {
      disabledBackground: '#878787',
      active: '#000',
      hover: '#000',
      disabled: '#FBFFF2',
    },
  },
  typography: {
    fontFamily: ['"Poppins"', 'sans-serif'].join(','),
    fontSize: 15,
    h1: {
      fontSize: 50,
    },
    h2: {
      fontWeight: 800,
      fontSize: 24,
    },
    h3: {
      fontWeight: 800,
      fontSize: 22,
    },
    h4: {
      fontWeight: 800,
      fontSize: 18,
    },
    h5: {
      fontWeight: 600,
      fontSize: 15,
    },
    h6: {
      fontWeight: 500,
      fontSize: 13,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: 11,
    },
    caption: {
      fontWeight: 500,
      fontSize: 68,
    }
  },
  overrides: {
    MuiOutlinedInput: {
      root: {
        '& $notchedOutline': {
          borderColor: 'white',
        },
        '&$focused $notchedOutline': {
          borderColor: 'white',
        },
        '& .MuiSelect-root ~ $notchedOutline': {
          borderColor: 'white',
        },
        '&$focused .MuiSelect-root ~ $notchedOutline': {
          borderColor: 'white',
        },
        '& .MuiSvgIcon-root?': {
          color: 'white',
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: "2em",
        fontWeight: "0",
        fontFamily: '',
        color: "yellow",
        backgroundColor: 'rgba(32, 32, 42, 1.0)',
        border: '1px solid grey',
        borderRadius: '10px'
      }
    }
  },
});

export default newTheme;
