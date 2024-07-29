// import { ChainId } from '@pancakeswap-libs/sdk';
import { ChainId } from '@spookyswap/sdk';
import { Configuration } from './based-finance/config';
import { BankInfo } from './based-finance';

const configurations: { [env: string]: Configuration } = {
  development: {
    chainId: ChainId.FTMTESTNET,
    networkName: 'Fantom Opera Testnet',
    ftmscanUrl: 'https://testnet.ftmscan.com',
    defaultProvider: 'https://rpc.testnet.fantom.network/',
    deployments: require('./based-finance/deployments/deployments.testing.json'),
    externalTokens: {
      TOMB: ['0xDdE62CAc89D515F4F938D9d3B9962508ba56734c', 18],
      WFTM: ['0xf1277d1ed8ad466beddf92ef448a132661956621', 18],
      FUSDT: ['0xb7f24e6e708eabfaa9e64b40ee21a5adbffb51d6', 6],
      BOO: ['0x14f0C98e6763a5E13be5CE014d36c2b69cD94a1e', 18],
      ZOO: ['0x2317610e609674e53D9039aaB85D8cAd8485A7c5', 0],
      SHIBA: ['0x39523112753956d19A3d6a30E758bd9FF7a8F3C0', 9],
      'USDC-FTM-LP': ['0xE7e3461C2C03c18301F66Abc9dA1F385f45047bA', 18],
      'BSHARE-FTM-LP': ['0x6F607443DC307DCBe570D0ecFf79d65838630B56', 18],
      'BASED-TOMB-LP': ['0x56106aade67cf41844d6abaacfd90b05ccf6b1a0', 18],
    },
    externalNftTokens: {
      'JOPA': ['0x9D12EDD4A590aee205cb205aA0906035d56a4FdE', 18]
    },
    baseLaunchDate: new Date('2021-06-02 13:00:00Z'),
    bondLaunchesAt: new Date('2020-12-03T15:00:00Z'),
    acropolisLaunchesAt: new Date('2020-12-11T00:00:00Z'),
    refreshInterval: 10000,
  },
  production: {
    chainId: ChainId.MAINNET,
    networkName: 'Fantom Opera Mainnet',
    ftmscanUrl: 'https://ftmscan.com',
    defaultProvider: 'https://rpc.fantom.network',
    deployments: require('./based-finance/deployments/deployments.mainnet.json'),
    externalTokens: {
      TOMB: ['0x6c021Ae822BEa943b2E66552bDe1D2696a53fbB7', 18],
      SOLID: ['0x888EF71766ca594DED1F0FA3AE64eD2941740A20', 18],
      TSHARE: ['0x4cdF39285D7Ca8eB3f090fDA0C069ba5F4145B37', 18],
      ETH: ['0x74b23882a30290451A17c44f4F05243b6b58C76d', 18],
      STATER: ['0x5706d4d6694D22A11d98678Db9D461eadbeE7e41', 18],
      MAI: ['0xfB98B335551a418cD0737375a2ea0ded62Ea213b', 18],
      BBOND: ['0xC078285F16665B3F4bCe74AbDCF0f4C877de3E9f', 18],
      CURVE_GEIST: ['0xd4f94d0aaa640bbb72b5eec2d85f6d114d81a88e', 18],
      CURVE_TRICRYPTO: ['0x00702bbdead24c40647f235f15971db0867f6bdb', 18],
      CURVE_GEIST_V2: ['0xD02a30d33153877BC20e5721ee53DeDEE0422B2F', 18],
      CURVE_TRICRYPTO_V2: ['0x58e57cA18B7A47112b877E31929798Cd3D703b0f', 18],
      'FTM-USDC-LP': ['0x7a6C9B27e20560253d4080944A252494C702f1a2', 18],
      'BSHARE-FTM-LP': ['0x52A5B9E36F53b54Ed9ddd7a4e66Ac26696E9F0be', 18],
      'BASED-BSHARE-LP': ['0x5748b5Dd1f59342f85d170c48C427959c2f9f262', 18],
      'BASED-TOMB-LP': ['0xf799AEa5df9fc8faC93D5e2A5277b4E82817ccB5', 18],
      'FTM-TOMB-LP': ['0xd4DDdF08F12e8eA1d7dd5a47418cDF3d93A5be96', 18],
      'BASED-MAI-LP': ['0x7B5B3751550be4FF87aC6bda89533F7A0c9825B3', 18],
      'BASED-USDC-LP': ['0x7c849a7E2cb08f09cf37482cc0A04ecB5891844a', 18],
      'BASED-TOMB-TSWAP-LP': ['0x172BFaA8991A54ABD0b3EE3d4F8CBDab7046FF79', 18],
      'MOO-BASED-BASED-TOMB': ['0xEb27F60f652fF53cBf3EfF0c7033B380148b6CB9', 18],
      //NEXTGEN
      SMELT: ['0x141FaA507855E56396EAdBD25EC82656755CD61e', 18],
      OBOL: ['0x1539C63037D95f84A5981F96e43850d1451b6216', 18], //0x1539C63037D95f84A5981F96e43850d1451b6216
      LIF3: ['0xbf60e7414EF09026733c1E7de72E7393888C64DA', 18],
      USDC: ['0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', 6],
      FTM: ['0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', 18],
      WFTM: ['0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', 18],
      'LIF3-WFTM-LP' : ['0xd62CAcDb69000feD31bb348e9c0e073BB8AD7cAF', 18],
      'SMELT-FTM-LP' : ['0x432a4654BC67ed86B3119cD256c490F2CEA1e42a', 18],
      'OBOL-FTM-LP' : ['0xE3E26Bd9cD2F32a8F60BfFf5DF88bB3b3C5Eb9f9', 18],
      'SMELT-FTM-LP-SPOOKY' : ['0x02E060A4B8453C5dA554d66c2035e3163D453daA', 18],
      'OBOL-FTM-LP-SPOOKY' : ['0x47FcE13359ac80Cc1FC98D46688701B2Bb54300C', 18],
      GodNft: ['0xc5777AD2250D7b12a3f2383afB4464b9E49bE297', 18],
      
      'GodFootprint' : ['0xBe9E38E6e3386D67e1b7A3754dc39a8cd8b82b08', 18],
      'ObolFtmReceipt' : ['0x4ef20669E38751E4a585638d12dCFc6FF3635Dd1', 18],
      'SmeltFtmReceipt' : ['0x2733C1DAa3891E7c9Cdf9bC2aCAD74Aa78578B3b', 18],

      SMELTER: ['0x34b0d4E3b6189865B304E54882bE5E2e833a026a', 18],
      'TWISTEDNODES' : ['0x22F234e38250B8b65e86e348A3d8Ca29eA6D4B6f', 18],
      'TWISTEDNODESMEDIUM' : ['0x525ca3877a78c6AE12292D0a55765775e3943379', 18],
      'TWISTEDNODESLONG' : ['0x62A2Ff4BcCC5dD5316C358cDF079EC5e5c0851fe', 18],

    },
    externalNftTokens: {
    },
    baseLaunchDate: new Date('2022-02-05 13:00:00Z'),
    bondLaunchesAt: new Date('2022-02-07T15:00:00Z'),
    acropolisLaunchesAt: new Date('2020-12-11T00:00:00Z'),
    refreshInterval: 10000,
  },
};

export const bankDefinitions: { [contractName: string]: BankInfo } = {
  /*
  Explanation:
  name: description of the card
  poolId: the poolId assigned in the contract
  sectionInUI: way to distinguish in which of the 3 pool groups it should be listed
        - 0 = Single asset stake pools
        - 1 = LP asset staking rewarding TOMB
        - 2 = LP asset staking rewarding TSHARE
  contract: the contract name which will be loaded from the deployment.environmnet.json
  depositTokenName : the name of the token to be deposited
  earnTokenName: the rewarded token
  finished: will disable the pool on the UI if set to true
  sort: the order of the pool
  */
  NftFarmingRewardPool: {
    name: 'Earn SMELT by NFT',
    poolId: 0,
    sectionInUI: 0,
    contract: 'NftFarmingRewardPool',
    depositTokenName: 'GodNft',
    depositFee: 0,
    earnTokenName: 'SMELT',
    finished: false,
    sort: 1,
    exchange: 'spookyswap',
    closedForStaking: true,
    isDepositNft: true,
    isZapEnabled: false,
    isEnabled: true
  },
  // StaterFarmingRewardPool: {
  //   name: 'Team Allocations',
  //   poolId: 1,
  //   sectionInUI: 0,
  //   contract: 'StaterFarmingRewardPool',
  //   depositTokenName: 'STATER',
  //   depositFee: 0,
  //   earnTokenName: 'SMELT',
  //   finished: false,
  //   sort: 9,
  //   exchange: 'none',
  //   closedForStaking: false,
  //   isDepositNft: false,
  //   isZapEnabled: false,
  //   isEnabled: true
  // },
  // FundFarmingRewardPool: {
  //   name: 'Protocol Fund',
  //   poolId: 2,
  //   sectionInUI: 0,
  //   contract: 'FundFarmingRewardPool',
  //   depositTokenName: 'SMELTER',
  //   depositFee: 0,
  //   earnTokenName: 'SMELT',
  //   finished: false,
  //   sort: 8,
  //   exchange: 'none',
  //   closedForStaking: false,
  //   isDepositNft: false,
  //   isZapEnabled: false,
  //   isEnabled: true
  // },
  ObolFTMFarmingRewardPool: {
    name: 'Earn SMELT by OBOL-FTM-LP',
    poolId: 3,
    sectionInUI: 0,
    contract: 'ObolFTMFarmingRewardPool',
    depositTokenName: 'OBOL-FTM-LP-SPOOKY',
    depositFee: 0,
    earnTokenName: 'SMELT',
    finished: false,
    sort: 2,
    exchange: 'spookyswap',
    closedForStaking: true,
    isDepositNft: false,
    isZapEnabled: false,
    isEnabled: true
  },
  SmeltFTMFarmingRewardPool: {
    name: 'Earn SMELT by SMELT-FTM-LP',
    poolId: 4,
    sectionInUI: 0,
    contract: 'SmeltFTMFarmingRewardPool',
    depositTokenName: 'SMELT-FTM-LP-SPOOKY',
    depositFee: 0,
    earnTokenName: 'SMELT',
    finished: false,
    sort: 3,
    exchange: 'spookyswap',
    closedForStaking: true,
    isDepositNft: false,
    isZapEnabled: false,
    isEnabled: true
  },

  BBondObolGenesisRewardPool: {
    name: 'Earn OBOL by BBOND',
    poolId: 1,
    sectionInUI: 0,
    contract: 'ObolGenesisRewardPool',
    depositTokenName: 'BBOND',
    depositFee: 0,
    earnTokenName: 'OBOL',
    finished: false,
    sort: 4,
    exchange: 'spookyswap',
    closedForStaking: true,
    isDepositNft: false,
    isZapEnabled: false,
    isEnabled: true
  },
  TombObolGenesisRewardPool: {
    name: 'Earn OBOL by TOMB',
    poolId: 5,
    sectionInUI: 0,
    contract: 'TombGenesisRewardPool',
    depositTokenName: 'TOMB',
    depositFee: 1,
    earnTokenName: 'OBOL',
    finished: false,
    sort: 5,
    exchange: 'spookyswap',
    closedForStaking: true,
    isDepositNft: false,
    isZapEnabled: false,
    isEnabled: true
  },
 
  // SmeltFtmLPRewardPool: {
  //   name: 'Earn OBOL by SMELT-FTM-LP',
  //   poolId: 7,
  //   sectionInUI: 0,
  //   contract: 'SmeltFTMGenesisRewardPool',
  //   depositTokenName: 'SMELT-FTM-LP',
  //   depositFee: 0,
  //   earnTokenName: 'OBOL',
  //   finished: false,
  //   sort: 3,
  //   exchange: 'spookyswap',
  //   closedForStaking: true,
  //   isDepositNft: false,
  //   isZapEnabled: true,
  //   isEnabled: true
  // },
  // ObolFtmLPRewardPool: {
  //   name: 'Earn OBOL by OBOL-FTM-LP',
  //   poolId: 6,
  //   sectionInUI: 0,
  //   contract: 'ObolFTMGenesisRewardPool',
  //   depositTokenName: 'OBOL-FTM-LP',
  //   depositFee: 0,
  //   earnTokenName: 'OBOL',
  //   finished: false,
  //   sort: 4,
  //   exchange: 'spookyswap',
  //   closedForStaking: true,
  //   isDepositNft: false,
  //   isZapEnabled: true,
  //   isEnabled: true
  // },

  //READY
  Lif3ObolGenesisRewardPool: {
    name: 'Earn OBOL by LIF3',
    poolId: 4,
    sectionInUI: 0,
    contract: 'LIF3ObolGenesisRewardPool',
    depositTokenName: 'LIF3',
    depositFee: 0.5,
    earnTokenName: 'OBOL',
    finished: false,
    sort: 6,
    exchange: 'spookyswap',
    closedForStaking: true,
    isDepositNft: false,
    isZapEnabled: false,
    isEnabled: true
  },


  // WFTMObolGenesisRewardPool: {
  //   name: 'Earn OBOL by WFTM',
  //   poolId: 2,
  //   sectionInUI: 0,
  //   contract: 'WFTMObolGenesisRewardPool',
  //   depositTokenName: 'WFTM',
  //   depositFee: 1,
  //   earnTokenName: 'OBOL',
  //   finished: false,
  //   sort: 7,
  //   exchange: 'spookyswap',
  //   closedForStaking: true,
  //   isDepositNft: false,
  //   isZapEnabled: false,
  //   isEnabled: true
  // },


  //SMELT FArMING POOLS section in UI 3
 
  NftFootprintsSmeltRewardPool: {
    name: 'Earn SMELT by NFT',
    poolId: 0,
    sectionInUI: 3,
    contract: 'NftFootprintsSmeltRewardPool',
    depositTokenName: 'GodNft',
    depositFee: 0,
    earnTokenName: 'SMELT',
    finished: false,
    sort: 1,
    exchange: 'spookyswap',
    closedForStaking: false,
    isDepositNft: true,
    isZapEnabled: false,
    isEnabled: true,
    recietTokenName: 'GodFootprint'
  },
   // team pools Section in UI 1

  StaterFootprintsSmeltRewardPool: {
    name: 'Team Allocations',
    poolId: 1,
    sectionInUI: 1,
    contract: 'StaterFootprintsSmeltRewardPool',
    depositTokenName: 'STATER',
    depositFee: 0,
    earnTokenName: 'SMELT',
    finished: false,
    sort: 3,
    exchange: 'none',
    closedForStaking: false,
    isDepositNft: false,
    isZapEnabled: false,
    isEnabled: true
  },
  FundFootprintsSmeltRewardPool: {
    name: 'Protocol Fund',
    poolId: 2,
    sectionInUI: 1,
    contract: 'FundFootprintsSmeltRewardPool',
    depositTokenName: 'SMELTER',
    depositFee: 0,
    earnTokenName: 'SMELT',
    finished: false,
    sort: 3,
    exchange: 'none',
    closedForStaking: false,
    isDepositNft: false,
    isZapEnabled: false,
    isEnabled: true
  },
 
  ObolFtmFootprintsSmeltRewardPool: {
    name: 'Earn SMELT by OBOL-FTM-LP',
    poolId: 3,
    sectionInUI: 3,
    contract: 'ObolFtmFootprintsSmeltRewardPool',
    depositTokenName: 'OBOL-FTM-LP',
    depositFee: 0,
    earnTokenName: 'SMELT',
    finished: false,
    sort: 2,
    exchange: 'spookyswap',
    closedForStaking: false,
    isDepositNft: false,
    recietTokenName: 'ObolFtmReceipt',
    isZapEnabled: false,
    isEnabled: true
  },
 
  SmeltFtmFootprintsSmeltRewardPool: {
    name: 'Earn SMELT by SMELT-FTM-LP',
    poolId: 4,
    sectionInUI: 3,
    contract: 'SmeltFtmFootprintsSmeltRewardPool',
    depositTokenName: 'SMELT-FTM-LP',
    depositFee: 0,
    earnTokenName: 'SMELT',
    finished: false,
    sort: 3,
    exchange: 'spookyswap',
    closedForStaking: false,
    isDepositNft: false,
    recietTokenName: 'SmeltFtmReceipt',
    isZapEnabled: false,
    isEnabled: true
  },
 

  
};

export default configurations['production'];
