import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Radio, { RadioProps } from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import { InputProps } from '../Input';
import {Typography} from "@material-ui/core";

interface TokenInputProps extends InputProps {
  onSelectMax?: () => void;
  fontSize?: number;
  isArray?: boolean;
  slippageTypes?: string[]
}

const SlippageInput: React.FC<TokenInputProps> = ({ onChange, value, fontSize = '', isArray=false, slippageTypes }) => {
  return (
    <FormControl>
      <RadioGroup row defaultValue="10" value={value} name="radio-buttons-group" onChange={onChange}>
        { isArray ? (
          <>
              {slippageTypes
                  ?.map((slippageItem) => (
                      <React.Fragment key={slippageItem}>
                        <FormControlLabel value={slippageItem} control={<StyledRadio />} label={<Typography style={{fontSize: fontSize}} color={'primary'} >{slippageItem}%</Typography>}/>
                      </React.Fragment>
              ))}
          </>
        ) : (
          <>
            <FormControlLabel value="10" control={<StyledRadio />} label={<Typography style={{fontSize: fontSize}} color={'primary'} >0.1%</Typography>}/>
            <FormControlLabel value="100" control={<StyledRadio />} label={<Typography style={{fontSize: fontSize}} color={'primary'} >1%</Typography>}/>
            <FormControlLabel value="300" control={<StyledRadio />} label={<Typography style={{fontSize: fontSize}} color={'primary'} >3%</Typography>} />
            <FormControlLabel value="500" control={<StyledRadio />} label={<Typography style={{fontSize: fontSize}} color={'primary'} >5%</Typography>} />
            <FormControlLabel value="5000" control={<StyledRadio />} label={<Typography style={{fontSize: fontSize}} color={'primary'} >50%</Typography>} />
          </>
        )}
      </RadioGroup>
    </FormControl>
  );
};

const useStyles = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  icon: {
    borderRadius: '50%',
    width: 16,
    height: 16,
    boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: '#f5f8fa',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
    '$root.Mui-focusVisible &': {
      outline: '2px auto rgba(19,124,189,.6)',
      outlineOffset: 2,
    },
    'input:hover ~ &': {
      backgroundColor: '#ebf1f5',
    },
    'input:disabled ~ &': {
      boxShadow: 'none',
      background: 'rgba(206,217,224,.5)',
    },
  },
  checkedIcon: {
    backgroundColor: '#a97c50',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&:before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
      content: '""',
    },
    'input:hover ~ &': {
      backgroundColor: '#c7935f',
    },
  },
});

// Inspired by blueprintjs
function StyledRadio(props: RadioProps) {
  const classes = useStyles();

  return (
    <Radio
      className={classes.root}
      disableRipple
      color="default"
      checkedIcon={<span className={clsx(classes.icon, classes.checkedIcon)} />}
      icon={<span className={classes.icon} />}
      {...props}
    />
  );
}

export default SlippageInput;
