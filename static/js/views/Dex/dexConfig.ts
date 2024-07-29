import { DexTokenInfo, DexPairInfo, DexFarmInfo } from '../../based-finance/types';

export const dexTokens: { [contractName: string]: DexTokenInfo } = {
  SMELT: {
    isTaxed: true,
    name: "SMELT",
    address: "0x141FaA507855E56396EAdBD25EC82656755CD61e",
    symbol: "SMELT"
  },
  OBOL: {
    isTaxed: true,
    name: "OBOL",
    address: "0x1539C63037D95f84A5981F96e43850d1451b6216",
    symbol: "OBOL"
  },
  WFTM: {
    isTaxed: false,
    name: "WFTM",
    address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    symbol: "WFTM"
  },
  FTM: {
    isTaxed: false,
    name: "FTM",
    address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    symbol: "FTM"
  },
  USDC: {
    isTaxed: false,
    name: "USDC",
    address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
    symbol: "USDC"
  },
  BSHARE: {
    isTaxed: false,
    name: "BSHARE",
    address: "0x49C290Ff692149A4E16611c694fdED42C954ab7a",
    symbol: "BSHARE"
  }
};
export const dexFarms: { [pairName: string]: DexFarmInfo } = {
  WLIUHI_ZALUPA:{
    farmUrl: "https://next-gen.basedfinance.io/genesis/NftFarmingRewardPool",
    pair: "0x0ca9783090865a15f6111DbB2001B3f1319D02E6",
    logo: "",
    by: "BasedFinance"
  }
}

export const dexPairs: { [contractName: string]: DexPairInfo } = {
  // WLIUHI_ZALUPA:{
  //   address: "0x0ca9783090865a15f6111DbB2001B3f1319D02E6",
  //   token0Address: "WFTM",
  //   token1Address: "USDC"
  //   },
  // WLIUHI_JOPA:{
  //   address: "0x0ca9783090865a15f6111DbB2001B3f1319D02E6",
  //   token0Address: "WFTM",
  //   token1Address: "USDC"
  //   }
};
