import React from 'react';

//Graveyard ecosystem logos
import basedLogo from '../../assets/img/icons/based.svg';
import bShareLogo from '../../assets/img/icons/bshare.svg';
import bBondLogo from '../../assets/img/icons/bbond.svg';
import tombLogo from '../../assets/img/icons/tomb_2.svg';
import ethLogo from '../../assets/img/icons/eth.svg';
import ftmLogo from '../../assets/img/icons/ftm.svg';
import tshareLogo from '../../assets/img/icons/tshare.svg';
import solidLogo from '../../assets/img/icons/solidly.png';
import usdcLogo from '../../assets/img/icons/usdc.svg';
import maiLogo from '../../assets/img/icons/mai.svg';
import staterLogo from '../../assets/img/stater.png';
import BshareFtmLpLogo from '../../assets/img/icons/bshare-ftm-LP.svg';
import CurvePoolLogo from '../../assets/img/CurvePoolLogo.png';
import TricryptoPoolLogo from '../../assets/img/TricryptoPoolLogo.png';
import BasedCoinWatchLogo from '../../assets/img/BASED_COINWATCH_LOGO.png';
import BasedDexLogo from '../../assets/img/BASED_DEX_LOGO.png';
import BShareCoinWatchLogo from '../../assets/img/BSHARE_DEX_LOGO.png';
import BasedBshareLpLogo from '../../assets/img/icons/based-bshare-LP.svg';
import BasedMaiLpLogo from '../../assets/img/icons/based-mai-LP.svg';
import BasedUSDCLpLogo from '../../assets/img/icons/based-usdc-LP.svg';

import basedTombLpLogo from '../../assets/img/icons/based-tomb-LP.svg';
import BasedTombTombSwapLp from '../../assets/img/icons/based-tomb-LP.svg';
import BasedTombLpZapTSwap from '../../assets/img/icons/based-tomb-LP-tswap.svg';
import BasedMaiLpZapTswap from '../../assets/img/icons/based-maiLP-tswap.svg';
import BasedTombLpZapSpooky from '../../assets/img/icons/based-tomb-LP-spooky.svg';
import BshareFtmLpZapSpooky from '../../assets/img/icons/bshare-ftm-LP-spooky.svg';
import MooBasedBasedTomb from '../../assets/img/icons/based-tomb-LP-beefy.svg';
import GodNft from '../../assets/img/preview.gif';
import DecorativeLogo from '../../assets/img/icons/decorativeToken.png';
import Lif3Logo from '../../assets/img/icons/LIF3.webp';
import ObolLogo from '../../assets/img/icons/obol.svg';
import SmeltLogo from '../../assets/img/icons/smelt.svg';
import ObolFtmLP from '../../assets/img/icons/obol-ftm-lp.svg';
import SmeltFtmLP from '../../assets/img/icons/smelt-ftm-lp.svg';
import BuyTax from '../../assets/img/10buyTax.svg';
import SellTax from '../../assets/img/10sellTax.svg';
import BoardRoom from '../../assets/img/icons/boardroom.svg';
import usdcSimpleLogo from '../../assets/img/icons_nodes/usdc_no_back.svg';
import ftmSimpleLogo from '../../assets/img/icons_nodes/ftm_no_back.svg';
import smeltSimpleLogo from '../../assets/img/icons_nodes/ftm_no_back.svg';
import SmeltSimpleLogo from '../../assets/img/smelt-alone.svg'
import ObolSimpleLogo from '../../assets/img/icons_dex/obol_simple.svg'
import BshareSimple from '../../assets/img/icons_dex/bshare-simple.svg'
import BasedSimple from '../../assets/img/icons_dex/based-simple.svg'
import GodFootPrints from '../../assets/img/icons/god_footprints_white_full.svg';
import ObolFtmFootPrints from '../../assets/img/icons/obol_footprints_white_full.svg';
import SmeltFtmFootPrints from '../../assets/img/icons/smelt_footprints_white_full.svg';
import FuckMulti from '../../assets/img/icons_dex/fuckmulti.png'

const logosBySymbol: { [title: string]: string } = {
  //Real tokens
  //=====================
  BASED: basedLogo,
  BSHARE: bShareLogo,
  BBOND: bBondLogo,
  SOLID: solidLogo,
  TOMB: tombLogo,
  TSHARE: tshareLogo,
  ETH: ethLogo,
  WFTM: ftmLogo,
  'USDC(MULTI)': usdcLogo,
  'USDC': usdcLogo,
  MAI: maiLogo,
  STATER: staterLogo,
  CURVE_GEIST: CurvePoolLogo,
  CURVE_TRICRYPTO: TricryptoPoolLogo,
  CURVE_GEIST_V2: CurvePoolLogo,
  CURVE_TRICRYPTO_V2: TricryptoPoolLogo,
  BASED_COINWATCH: BasedCoinWatchLogo,
  BLEADI: basedLogo,
  GodNft: GodNft,
  OBOL: ObolLogo,
  SMELT: SmeltLogo,
  BUYTAX: BuyTax,
  SELLTAX: SellTax,
  SMELTER: staterLogo,
  BOARDROOM: BoardRoom,
  DECORATIVE: DecorativeLogo,
  GODFOOTPRINTS:GodFootPrints,
  OBOLFTMFOOTPRINTS: ObolFtmFootPrints,
  SMELTFTMFOOTPRINTS: SmeltFtmFootPrints,
  //Dexes
  //=====================
  BASED_DEX: BasedDexLogo,
  BSHARE_DEX: BShareCoinWatchLogo,
  'OBOL_SIMPLE': ObolSimpleLogo,
  'BSHARE_SIMPLE': BshareSimple,
  'BASED_SIMPLE': BasedSimple,
  'USDC_SIMPLE': usdcSimpleLogo,
  'USDC(MULTI)_SIMPLE': usdcSimpleLogo,
  'FTM_SIMPLE' : ftmSimpleLogo,
  'WFTM_SIMPLE' : ftmSimpleLogo,
  'SMELT_SIMPLE': SmeltSimpleLogo,
  'REWARD_SIMPLE': "",
  'BASED-TOMB-LP': basedTombLpLogo,
  'BSHARE-FTM-LP': BshareFtmLpLogo,
  'BASED-BSHARE-LP': BasedBshareLpLogo,
  'BASED-MAI-LP': BasedMaiLpLogo,
  'BASED-USDC-LP': BasedUSDCLpLogo,
  'BASED-TOMB-TSWAP-LP': BasedTombTombSwapLp,
  'BASED-TOMB-LP-ZAP-TSWAP': BasedTombLpZapTSwap,
  'BASED-MAI-LP-ZAP-TSWAP': BasedMaiLpZapTswap,
  'BASED-TOMB-LP-ZAP-SPOOKY': BasedTombLpZapSpooky,
  'BSHARE-FTM-LP-ZAP-SPOOKY': BshareFtmLpZapSpooky,
  'MOO-BASED-BASED-TOMB': MooBasedBasedTomb,
  'FUCKMULTI': FuckMulti,
  FTM: ftmLogo,
  'LIF3' : Lif3Logo,
  'OBOL-FTM-LP' : ObolFtmLP,
  'SMELT-FTM-LP' : SmeltFtmLP,
  'OBOL-FTM-LP-SPOOKY' : ObolFtmLP,
  'SMELT-FTM-LP-SPOOKY' : SmeltFtmLP
};

type LogoProps = {
  symbol: string;
  size?: number;
  style?: React.CSSProperties;
  isSimple?: boolean
};

const TokenSymbol: React.FC<LogoProps> = ({ symbol, size = 130, style, isSimple=false }) => {
  if( isSimple ){
    if (logosBySymbol[symbol+"_SIMPLE"]) {
      return <img src={logosBySymbol[symbol+"_SIMPLE"]} alt={`${symbol} Logo`} width={size} height={'auto'} style={style} />;
    }
  }
  if (!logosBySymbol[symbol]) {
    // throw new Error(`Invalid Token Logo symbol: ${symbol}`);
    return <img src={logosBySymbol['DECORATIVE']} alt={`${symbol} Logo`} width={size} height={'auto'} style={style} />;
  }
  return <img src={logosBySymbol[symbol]} alt={`${symbol} Logo`} width={size} height={'auto'} style={style} />;
};

export default TokenSymbol;
