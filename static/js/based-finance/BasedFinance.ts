import { Fetcher, Fetcher as FetcherSpirit, Route, Token, Token as TokenSpirit } from '@spookyswap/sdk';
import { Configuration } from './config';
import {
  ContractName,
  TokenStat,
  ShareTokenStat,
  AllocationTime,
  Bank,
  PoolStats,
  BShareSwapperStat,
  FTMLPStat,
  TOMBLPStat,
  MAILPStat,
  USDCLPStat,
  BoilerRoomStat
} from './types';
import { BigNumber, Contract, ethers, EventFilter, Event } from 'ethers';
import { decimalToBalance } from './ether-utils';
import { TransactionResponse } from '@ethersproject/providers';
import ERC20 from './ERC20';
import { getFullDisplayBalance, getDisplayBalance } from '../utils/formatBalance';
import { getDefaultProvider } from '../utils/provider';
import IUniswapV2PairABI from './IUniswapV2Pair.abi.json';
import config, { bankDefinitions } from '../config';
import moment from 'moment';
import { parseUnits } from 'ethers/lib/utils';
import  { twistedNodes } from '../views/TwistedNodes/nodesConfig';
import {Pair} from './uniswap-based-sdk'
import {CurrencyAmount as UniCurrencyAmount,Token as UniToken} from '@uniswap/sdk-core';

import {
  SPOOKY_ROUTER_ADDR,
  FTM_TICKER,
  WFTM_TICKER,
  TICKER,
  OBOL_TICKER,
  SMELT_TICKER,
} from '../utils/constants';



//import useStakedTokenPriceInDollars from '../hooks/useStakedTokenPriceInDollars';
/**
 * An API module of Based Finance contracts.
 * All contract-interacting domain logic should be defined in here.
 */
export class BasedFinance {
  myAccount: string;
  provider: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  config: Configuration;
  contracts: { [name: string]: Contract };
  externalTokens: { [name: string]: ERC20 };
  BoardroomVersionOfUser?: string;
  parthenonVersionOfUser?: string;
  BoardroomFundEvents: Array<Event> = [];
  lastEpoch: number = 0;
  //Store abis
  abis: {[name: string]: any[]};

  BASED: ERC20;
  BSHARE: ERC20;
  BBOND: ERC20;
  TOMB: ERC20;
  TSHARE: ERC20;
  SOLID: ERC20;
  FTM: ERC20;
  WFTM: ERC20;
  USDC: ERC20;
  //BASED NEXT GEN
  OBOL: ERC20;
  SMELT: ERC20;
  LIF3: ERC20;
  
  OBOLFTM_LP: Contract;
  SMELTFTM_LP: Contract;
  BSHARE_FTM_LP: ERC20;

  OBFTM_LP: ERC20;
  SMFTM_LP: ERC20;

  STATER: ERC20;
  SMELTER: ERC20;
  nftRankData: any;


  constructor(cfg: Configuration) {
    const { deployments, externalTokens } = cfg;
    const provider = getDefaultProvider();

    this.nftRankData = require('../assets/rank.json');

    // loads contracts from deployments
    this.contracts = {};
    this.abis = {};
    for (const [name, deployment] of Object.entries(deployments)) {
      this.contracts[name] = new Contract(deployment.address, deployment.abi, provider);
      this.abis[name] = deployment.abi;
    }
    this.externalTokens = {};
    for (const [symbol, [address, decimal]] of Object.entries(externalTokens)) {
      this.externalTokens[symbol] = new ERC20(address, provider, symbol, decimal);
    }
    this.BASED = new ERC20(deployments.based.address, provider, 'BASED');
    this.BSHARE = new ERC20(deployments.bShare.address, provider, 'BSHARE');
    this.BBOND = new ERC20(deployments.bBond.address, provider, 'BBOND');
    this.TOMB = this.externalTokens['TOMB'];
    this.TSHARE = this.externalTokens['TSHARE'];
    this.USDC = this.externalTokens['USDC'];
    this.FTM = this.externalTokens['WFTM'];
    this.WFTM = this.externalTokens['WFTM'];

    this.STATER = this.externalTokens['STATER'];
    this.SMELTER = this.externalTokens['SMELTER'];

    //BASED V2
    this.LIF3 = this.externalTokens['LIF3'];
    this.OBOL = this.externalTokens['OBOL'];
    this.SMELT = this.externalTokens['SMELT'];

    this.OBFTM_LP = this.externalTokens['OBOL-FTM-LP'];
    this.SMFTM_LP = this.externalTokens['SMELT-FTM-LP'];
    this.BSHARE_FTM_LP = this.externalTokens['BSHARE-FTM-LP'];
    this.OBOLFTM_LP = new Contract(externalTokens['SMELT-FTM-LP'][0], IUniswapV2PairABI, provider);
    this.SMELTFTM_LP = new Contract(externalTokens['OBOL-FTM-LP'][0], IUniswapV2PairABI, provider);
    this.config = cfg;
    this.provider = provider;

  }

  getTokenFromExternal(tokenName: string) : ERC20 {
    return this.externalTokens[tokenName];
  }
  /**
   * @param provider From an unlocked wallet. (e.g. Metamask)
   * @param account An address of unlocked wallet account.
   */
  unlockWallet(provider: any, account: string) {
    const newProvider = new ethers.providers.Web3Provider(provider, this.config.chainId);
    this.signer = newProvider.getSigner(0);
    this.myAccount = account;
    for (const [name, contract] of Object.entries(this.contracts)) {
      this.contracts[name] = contract.connect(this.signer);
    }
    const tokens = [this.BASED, this.BSHARE, this.BBOND, ...Object.values(this.externalTokens)];
    for (const token of tokens) {
      token.connect(this.signer);
    }
    this.OBOLFTM_LP = this.OBOLFTM_LP.connect(this.signer);
    this.SMELTFTM_LP = this.SMELTFTM_LP.connect(this.signer);


    console.log(`🔓 Wallet is unlocked. Welcome, ${account}!`);
    this.fetchBoardroomVersionOfUser()
      .then((version) => (this.BoardroomVersionOfUser = version))
      .catch((err) => {
        console.error(`Failed to fetch Boardroom version: ${err.stack}`);
        this.BoardroomVersionOfUser = 'latest';
      });
  }

  get isUnlocked(): boolean {
    return !!this.myAccount;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //===================FROM SPOOKY TO DISPLAY =========================
  //=========================IN HOME PAGE==============================
  //===================================================================

  async getBasedStat(): Promise<TokenStat> {
    const { BasedTombGenesisRewardPool, BasedTombLPGenesisRewardPool } = this.contracts;
    const supply = await this.BASED.totalSupply();
    const basedRewardPoolSupply = await this.BASED.balanceOf(BasedTombGenesisRewardPool.address);
    //const basedRewardPoolSupply2 = await this.BASED.balanceOf(BasedTombLPGenesisRewardPool.address);
    //const basedRewardPoolSupplyOld = await this.BASED.balanceOf(BasedTombLpBasedRewardPoolOld.address);
    const basedCirculatingSupply = supply.sub(basedRewardPoolSupply);
    //.sub(basedRewardPoolSupply2)
    const priceInTOMB = await this.getTokenPriceInTomb(this.BASED);
    const priceOfOneTOMB = await this.getOneTOMBPriceInFTM();
    const priceOfOneFTM = await this.getFTMPriceInDollars();
    const priceOfBasedInDollars = (Number(priceInTOMB) * Number(priceOfOneTOMB) * Number(priceOfOneFTM)).toFixed(2); //TODO NAIOB *100

    return {
      tokenInTomb: priceInTOMB,
      priceInDollars: priceOfBasedInDollars,
      totalSupply: getDisplayBalance(supply, this.BASED.decimal, 0),
      circulatingSupply: getDisplayBalance(basedCirculatingSupply, this.BASED.decimal, 0),
      buyFee: 0,
      sellFee: 0
    };
  }

  async getObolStat(): Promise<TokenStat> {
    const { ObolGenesisRewardPool, obol } = this.contracts;
    const supply = await this.OBOL.totalSupply();
    const blifeRewardPoolSupply = await this.OBOL.balanceOf(ObolGenesisRewardPool.address);
    const balanceBoilerSupply = await this.OBOL.balanceOf("0x6bB173673cc128Aa8709B2Aa8108f6f9521AE0A0");
    const fundSupply = await this.OBOL.balanceOf("0x0A10daD90b9C6FB8B87BFf3857A4B012890C53A5");

    const blifeCirculatingSupply = supply.sub(blifeRewardPoolSupply).sub(balanceBoilerSupply).sub(fundSupply);

    const priceInFTM = await this.getTokenPriceInFtm(this.OBOL);
    const priceOfOneFTM = await this.getFTMPriceInDollars();
    const priceOfBasedInDollars = (Number(priceInFTM) * Number(priceOfOneFTM)).toFixed(2);
    // console.log(blifeCirculatingSupply.toString())
    // console.log(supply.toString())
    const obolBuyFee = Number(await obol.buyFee()) / 100;
    const obolSellFee = Number(await obol.sellFee()) / 100;
    return {
      tokenInTomb: priceInFTM,
      priceInDollars: priceOfBasedInDollars,
      totalSupply: getDisplayBalance(supply, this.OBOL.decimal, 0),
      circulatingSupply: getDisplayBalance(blifeCirculatingSupply, this.OBOL.decimal, 0),
      buyFee: obolBuyFee,
      sellFee: obolSellFee
    };
  }

  async getBoilerRoomStats(): Promise<BoilerRoomStat> {

    const balanceObolBoilerSupply = await this.OBOL.balanceOf("0x6bB173673cc128Aa8709B2Aa8108f6f9521AE0A0");
    const balanceSmeltBoilerSupply = await this.SMELT.balanceOf("0x6bB173673cc128Aa8709B2Aa8108f6f9521AE0A0");
    const balanceObolTeamWallet = await this.OBOL.balanceOf("0xc5bf5A56cEc938312A2528e2Bf5A5CBcaBEb33ea");
    const balanceSmeltTeamWallet = await this.SMELT.balanceOf("0xc5bf5A56cEc938312A2528e2Bf5A5CBcaBEb33ea");

    return {
      obolTotalSupply: getDisplayBalance(balanceObolBoilerSupply.add(balanceObolTeamWallet), this.OBOL.decimal),
      smeltTotalSupply: getDisplayBalance(balanceSmeltBoilerSupply.add(balanceSmeltTeamWallet), this.SMELT.decimal)
    };

  }

  /**
   * Calculates various stats for the requested LP
   * @param name of the LP token to load stats for
   * @returns
   */
  async getTombLPStat(name: string): Promise<TOMBLPStat> {
    const lpToken = this.externalTokens[name];
    const lpTokenSupplyBN = await lpToken.totalSupply();
    const lpTokenSupply = getDisplayBalance(lpTokenSupplyBN, 18);
    const token0 = this.BASED;
    const isBased = name.startsWith('BASED');
    const tokenAmountBN = await token0.balanceOf(lpToken.address);
    const tokenAmount = getDisplayBalance(tokenAmountBN, 18);

    const tombAmountBN = await this.TOMB.balanceOf(lpToken.address);
    const tombAmount = getDisplayBalance(tombAmountBN, 18);

    const tokenAmountInOneLP = Number(tokenAmount) / Number(lpTokenSupply);
    const tombAmountInOneLP = Number(tombAmount) / Number(lpTokenSupply);
    const lpTokenPrice = await this.getLPTokenPrice(lpToken, token0, isBased);

    const lpTokenPriceFixed = Number(lpTokenPrice).toFixed(8).toString();
    const liquidity = (Number(lpTokenSupply) * Number(lpTokenPrice)).toFixed(8).toString();
    return {
      tokenAmount: tokenAmountInOneLP.toFixed(8).toString(),
      tombAmount: tombAmountInOneLP.toFixed(8).toString(),
      priceOfOne: lpTokenPriceFixed,
      totalLiquidity: liquidity,
      totalSupply: Number(lpTokenSupply).toFixed(8).toString(),
    };
  }

  async getUSDCLPStat(name: string): Promise<USDCLPStat> {
    const lpToken = this.externalTokens[name];
    const lpTokenSupplyBN = await lpToken.totalSupply();
    const lpTokenSupply = getDisplayBalance(lpTokenSupplyBN, 18);
    const token0 = this.BASED;
    const isBased = name.startsWith('BASED');
    const tokenAmountBN = await token0.balanceOf(lpToken.address);
    const tokenAmount = getDisplayBalance(tokenAmountBN, 18);

    const USDCAmountBN = await this.USDC.balanceOf(lpToken.address);
    const USDCAmount = getDisplayBalance(USDCAmountBN, 18);

    const tokenAmountInOneLP = Number(tokenAmount) / Number(lpTokenSupply);
    const USDCAmountInOneLP = Number(USDCAmount) / Number(lpTokenSupply);
    const lpTokenPrice = await this.getLPTokenPrice(lpToken, token0, isBased);

    const lpTokenPriceFixed = Number(lpTokenPrice).toFixed(8).toString();
    const liquidity = (Number(lpTokenSupply) * Number(lpTokenPrice)).toFixed(8).toString();
    return {
      basedAmount: tokenAmountInOneLP.toFixed(8).toString(),
      USDCAmount: USDCAmountInOneLP.toFixed(8).toString(),
      priceOfOne: lpTokenPriceFixed,
      totalLiquidity: liquidity,
      totalSupply: Number(lpTokenSupply).toFixed(8).toString(),
    };
  }

 /**
   * Calculates the price of an LP token
   * Reference https://github.com/DefiDebauchery/discordpricebot/blob/4da3cdb57016df108ad2d0bb0c91cd8dd5f9d834/pricebot/pricebot.py#L150
   * @param lpToken the token under calculation
   * @param token the token pair used as reference (the other one would be TOMB in most cases)
   * @param isBased sanity check for usage of based token or bShare
   * @returns price of the LP token
   */
  async getBshareLPTokenPrice(lpToken: ERC20, token: ERC20, isBased: boolean): Promise<string> {
    const totalSupply = getFullDisplayBalance(await lpToken.totalSupply(), lpToken.decimal);
    //Get amount of tokenA
    const tokenSupply = getFullDisplayBalance(await token.balanceOf(lpToken.address), token.decimal);
    const stat = isBased === true ? await this.getObolStat() : await this.getShareStat();
    const priceOfToken = stat.priceInDollars;
    const tokenInLP = Number(tokenSupply) / Number(totalSupply);

    const tokenPrice = (Number(priceOfToken) * tokenInLP * 2) //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
      .toString();
    return tokenPrice;
  }

  async getFtmLPStat(name: string): Promise<FTMLPStat> {
    const lpToken = this.externalTokens[name];
    const lpTokenSupplyBN = await lpToken.totalSupply();
    const lpTokenSupply = getDisplayBalance(lpTokenSupplyBN, 18);

    const token0 = this.BSHARE;
    const isBased = name.startsWith('BASED');
    const tokenAmountBN = await token0.balanceOf(lpToken.address);
    const tokenAmount = getDisplayBalance(tokenAmountBN, 18);

    const ftmAmountBN = await this.WFTM.balanceOf(lpToken.address);
    const ftmAmount = getDisplayBalance(ftmAmountBN, 18);
    const tokenAmountInOneLP = Number(tokenAmount) / Number(lpTokenSupply);
    const ftmAmountInOneLP = Number(ftmAmount) / Number(lpTokenSupply);
    const lpTokenPrice = await this.getBshareLPTokenPrice(lpToken, token0, isBased);
    const lpTokenPriceFixed = Number(lpTokenPrice).toFixed(8).toString();
    const liquidity = (Number(lpTokenSupply) * Number(lpTokenPrice)).toFixed(8).toString();
    return {
      tokenAmount: tokenAmountInOneLP.toFixed(8).toString(),
      ftmAmount: ftmAmountInOneLP.toFixed(8).toString(),
      priceOfOne: lpTokenPriceFixed,
      totalLiquidity: liquidity,
      totalSupply: Number(lpTokenSupply).toFixed(8).toString(),
    };
  }


  async getObolSmeltFtmLPStat(name: string, isObol: boolean): Promise<FTMLPStat> {
    const lpToken = this.externalTokens[name];
    const lpTokenSupplyBN = await lpToken.totalSupply();
    const lpTokenSupply = getDisplayBalance(lpTokenSupplyBN, 18);

    let token0 : any;
    if( isObol )
      token0 = this.OBOL;
    else
      token0 = this.SMELT;
    const tokenAmountBN = await token0.balanceOf(lpToken.address);
    const tokenAmount = getDisplayBalance(tokenAmountBN, 18);

    const ftmAmountBN = await this.WFTM.balanceOf(lpToken.address);
    const ftmAmount = getDisplayBalance(ftmAmountBN, 18);
    const tokenAmountInOneLP = Number(tokenAmount) / Number(lpTokenSupply);
    const ftmAmountInOneLP = Number(ftmAmount) / Number(lpTokenSupply);
    const lpTokenPrice = await this.getLPTokenPrice(lpToken, token0, isObol);
    const lpTokenPriceFixed = Number(lpTokenPrice).toFixed(8).toString();
    const liquidity = (Number(lpTokenSupply) * Number(lpTokenPrice)).toFixed(8).toString();

    return {
      tokenAmount: tokenAmountInOneLP.toFixed(8).toString(),
      ftmAmount: ftmAmountInOneLP.toFixed(8).toString(),
      priceOfOne: lpTokenPriceFixed,
      totalLiquidity: liquidity,
      totalSupply: Number(lpTokenSupply).toFixed(8).toString(),
    };
  }

  /**
   * Use this method to get price for Based
   * @returns TokenStat for BBOND
   * priceInTOMB
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   */
  async getBondStat(): Promise<TokenStat> {
    const { Treasury } = this.contracts;
    const basedStat = await this.getBasedStat();
    const bondBasedRatioBN = await Treasury.getBondPremiumRate();
    const modifier = bondBasedRatioBN / 1e18 > 1 ? bondBasedRatioBN / 1e18 : 1;
    const bondPriceInTOMB = (Number(basedStat.tokenInTomb) * modifier).toFixed(4);
    const priceOfBBondInDollars = (Number(basedStat.priceInDollars) * modifier).toFixed(2);
    const supply = await this.BBOND.displayedTotalSupply();
    return {
      tokenInTomb: bondPriceInTOMB,
      priceInDollars: priceOfBBondInDollars,
      totalSupply: supply,
      circulatingSupply: supply,
      buyFee: 0,
      sellFee: 0
    };
  }

    /**
   * @returns TokenStat for SMELT
   * priceInFTM
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   * ===================BSHARE PRICE IN WFTM ONLY!!!================
   */
     async getSmeltStat(): Promise<ShareTokenStat> {
      const { ObolGenesisRewardPool, smelt } = this.contracts;
      const supply = await this.SMELT.totalSupply();
  
      const priceInFTM = await this.getTokenPriceInFtm(this.SMELT);
      let balanceFund = await this.SMELT.balanceOf("0x2EDb7f36830Abb77AF9D6Fe1b97b2251E5BE1d66");
      const balanceBoilerSupply = await this.SMELT.balanceOf("0x6bB173673cc128Aa8709B2Aa8108f6f9521AE0A0"); 
      const balanceFarmingRewardPool = await this.SMELT.balanceOf("0x7A1f47c8a26fD895228947ffc0482F3dD9c2cA29");
      const bShareCirculatingSupply = supply.sub(balanceFund).sub(balanceBoilerSupply).sub(balanceFarmingRewardPool);
      const priceOfOneFTM = await this.getFTMPriceInDollars();
      const priceOfSharesInDollars = (Number(priceInFTM) * Number(priceOfOneFTM)).toFixed(2);
      const smeltBuyFee = Number(await smelt.buyFee()) / 100;
      const smeltSellFee = Number(await smelt.sellFee()) / 100;

      return {
        tokenInFtm: priceInFTM,
        priceInDollars: priceOfSharesInDollars,
        totalSupply: getDisplayBalance(supply, this.SMELT.decimal, 0),
        circulatingSupply: getDisplayBalance(bShareCirculatingSupply, this.SMELT.decimal, 4),
        buyFee: smeltBuyFee,
        sellFee: smeltSellFee
      };
    }

  /**
   * @returns TokenStat for BSHARE
   * priceInFTM
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for bonds)
   * ===================BSHARE PRICE IN WFTM ONLY!!!================
   */
  async getShareStat(): Promise<ShareTokenStat> {
    const { BasedTombLPBShareRewardPool } = this.contracts;

    const supply = await this.BSHARE.totalSupply();

    const priceInFTM = await this.getTokenPriceInFtmShort(this.BSHARE);
    const bshareRewardPoolSupply = await this.BSHARE.balanceOf(BasedTombLPBShareRewardPool.address);
    const bShareCirculatingSupply = supply.sub(bshareRewardPoolSupply);
    const priceOfOneFTM = await this.getFTMPriceInDollars();
    const priceOfSharesInDollars = (Number(priceInFTM) * Number(priceOfOneFTM)).toFixed(2);

    return {
      tokenInFtm: priceInFTM,
      priceInDollars: priceOfSharesInDollars,
      totalSupply: getDisplayBalance(supply, this.BSHARE.decimal, 0),
      circulatingSupply: getDisplayBalance(bShareCirculatingSupply, this.BSHARE.decimal, 0),
      buyFee: 0,
      sellFee: 0
    };
  }

  async getBasedPriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBasedUpdatedPrice();
  }

  async getCurrentBasedPrice(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return await Treasury.getBasedPrice();
  }

  async getBondsPurchasable(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBurnableBasedLeft();
  }

  getPoolIdFromPoolName(poolName: string): number {
    switch (poolName) {
      case 'ETH':
        return 8;
      case 'TOMB':
        return 5; 
      case 'BBOND':
        return 1; 
      case 'WFTM':
        return 2;
      case 'USDC':
        return 3; 
      case 'LIF3':
        return 4; 
      case 'SMELT-FTM-LP':
        return 7;
      case 'OBOL-FTM-LP':
        return 6;
      case 'GodNft':
        return 0;
    }
  }


  getFarmingPoolIdFromPoolName(poolName: string): number {
    switch (poolName) {
      case 'SMELT-FTM-LP':
        return 4;
      case 'OBOL-FTM-LP':
        return 3;
      case 'STATER':
        return 1;
      case 'SMELTER':
        return 2;
      case 'GodNft':
        return 0;
    }
  }

    /**
  * Gets Smelt pool allocation with pool name
  *
  * @author Calypso
  * @param {number} poolName The pool name to get allocation points for
  * @return {Promise<Number>} The pool allocation points
  */
     async getSmeltPoolsAllocation(poolName: string): Promise<Number> {
      const { SmeltFTMFarmingRewardPool } = this.contracts;
      const poolId: number = this.getFarmingPoolIdFromPoolName(poolName);
      let poolAllocation: any;
  
      try {
        poolAllocation = await SmeltFTMFarmingRewardPool.poolInfo(poolId);
  
      } catch (error) {
        console.error(error);
      }
  
      if (poolAllocation) {
        return Number(getDisplayBalance(poolAllocation.allocPoint, 18, 0));
      } else {
        return 0;
      }
    }
  

  /**
   * Calculates the TVL, APR and daily APR of a provided pool/bank
   * @param bank
   * @returns
   */
  async getPoolAPRs(bank: Bank): Promise<PoolStats> {
    if (this.myAccount === undefined) return;

    if( !bank.isEnabled ){
      return {
        dailyAPR: "0",
        yearlyAPR: "0",
        TVL: "0"
      }
    }

    const depositToken = bank.depositToken;
    const poolContract = this.contracts[bank.contract];
    const depositTokenPrice = await this.getDepositTokenPriceInDollars(bank.depositTokenName, depositToken);
    const stakeInPool = await depositToken.balanceOf(bank.address);
    let stat: any;
    
    if( bank.earnTokenName === 'OBOL') {
      stat = await this.getObolStat()
    } else if( bank.earnTokenName === 'SMELT') {
      stat = await this.getSmeltStat()
    }



    const tokenPerSecond = await this.getTokenPerSecond(
      bank.earnTokenName,
      bank.contract,
      poolContract,
      bank.depositTokenName,
      bank.poolId
    );

    const tokenPerHour = tokenPerSecond.mul(60).mul(60);
    const totalRewardPricePerYear =
      Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24).mul(365)));
    const totalRewardPricePerDay = Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24)));

    let totalStakingTokenInPool : number;
    let TVL : number;



    
    if( bank.depositTokenName === 'GodNft' ){
      totalStakingTokenInPool =  Number(depositTokenPrice) * stakeInPool;
      TVL = Number(depositTokenPrice) * stakeInPool;
    }
    else{
      totalStakingTokenInPool = Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
      TVL = Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    }

    const dailyAPR = (totalRewardPricePerDay / totalStakingTokenInPool) * 100;
    const yearlyAPR = (totalRewardPricePerYear / totalStakingTokenInPool) * 100;



    return {
      dailyAPR: dailyAPR.toFixed(2).toString(),
      yearlyAPR: yearlyAPR.toFixed(2).toString(),
      TVL: TVL.toFixed(2).toString(),
    };
  }

  async getPoolsAllocation(poolName: string, poolId: number, poolContract: Contract): Promise<Number> {
    let poolAllocation: any;

    try {
      poolAllocation = await poolContract.poolInfo(poolId);
    } catch (error) {
      console.error(error);
    }

    if (poolAllocation) {
      return Number(getDisplayBalance(poolAllocation.allocPoint, 18, 0));
    } else {
      return 0;
    }
  }

  /**
   * Method to return the amount of tokens the pool yields per second
   * @param earnTokenName the name of the token that the pool is earning
   * @param contractName the contract of the pool/bank
   * @param poolContract the actual contract of the pool
   * @param depositTokenName the name of the deposit token
   * @returns
   */
  async getTokenPerSecond(
    earnTokenName: string,
    contractName: string,
    poolContract: Contract,
    depositTokenName: string,
    poolId: number
  ) {
    let rewardPerSecond : any;
    let time = 60 * 60 * 24 * 365;
    if( contractName.endsWith('GenesisRewardPool') ){
      time = 240 * 60 * 60;
      rewardPerSecond = await poolContract.oBolPerSecond();
    } 
    else if( contractName.endsWith('FootprintsSmeltRewardPool') ) {
      time = 60 * 60 * 24 * 800;
      rewardPerSecond = BigNumber.from(1150000000000000);
    }
    else {
      time = 60 * 60 * 24 * 800;
      rewardPerSecond = await poolContract.smeltPerSecond();
    }
    const totalAllocPoints = rewardPerSecond.mul(time);
    return rewardPerSecond.mul(await this.getPoolsAllocation(depositTokenName, poolId, poolContract)).div(getDisplayBalance(totalAllocPoints, 18, 0));
  }

  /**
   * Method to calculate the tokenPrice of the deposited asset in a pool/bank
   * If the deposited token is an LP it will find the price of its pieces
   * @param tokenName
   * @param token
   * @returns
   */
  async getDepositTokenPriceInDollars(tokenName: string, token: ERC20) {
    let tokenPrice;
    let tokenPriceInFtm;
    const priceOfOneFtmInDollars = await this.getFTMPriceInDollars();

    if (tokenName === 'WFTM') {
      tokenPrice = priceOfOneFtmInDollars;
    } else if (tokenName === 'TOMB') {
      tokenPriceInFtm = await this.getTokenPriceInFtmShort(token);
      tokenPrice = (Number(tokenPriceInFtm) * Number(priceOfOneFtmInDollars)).toString();
    } else if (tokenName === 'ETH') {
      tokenPriceInFtm = await this.getTokenPriceInFtmShort(token);
      tokenPrice = (Number(tokenPriceInFtm) * Number(priceOfOneFtmInDollars)).toString();
    } else if (tokenName === 'BASED-TOMB-LP') {
      tokenPrice = await this.getLPTokenPrice(token, this.BASED, true);
    } else if (tokenName === 'BSHARE-FTM-LP') {
      tokenPrice = await this.getLPTokenPrice(token, this.BSHARE, false);
    } else if (tokenName === 'STATER') {
      tokenPrice = '0.00001';
    } else if (tokenName === 'BASED-BSHARE-LP') {
      tokenPrice = await this.getLPTokenPrice(token, this.BSHARE, false);
    } else if (tokenName === 'GodNft'){
      tokenPrice = '500';
    } else if (tokenName === 'BBOND'){
      tokenPrice =  (await this.getBasedStat()).priceInDollars; //REMOVE TEST MULTIPLY
    } else if ( tokenName === 'LIF3' ){
      tokenPriceInFtm = await this.getTokenPriceInFtmShort(token);
      tokenPrice = (Number(tokenPriceInFtm) * Number(priceOfOneFtmInDollars)).toString();
    } else if (tokenName === 'OBOL-FTM-LP' || tokenName === 'OBOL-FTM-LP-SPOOKY'){
      tokenPrice = await this.getLPObolSmeltTokenPrice(token, this.OBOL, true); //TODO CHANGE STATS
    }else if (tokenName === 'SMELT-FTM-LP' || tokenName === 'SMELT-FTM-LP-SPOOKY'){
      tokenPrice = await this.getLPObolSmeltTokenPrice(token, this.SMELT, false); //TODO CHANGE STATS
    }else if(tokenName === 'SMELTER'){
      tokenPrice = '0.00001';
    }else {
      // =====================usdc deposit
      tokenPriceInFtm = await this.getTokenPriceInFtmShort(token);
      tokenPrice = (Number(tokenPriceInFtm) * Number(priceOfOneFtmInDollars)).toString();
    }
    return tokenPrice;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //=========================== END ===================================
  //===================================================================

  async getCurrentEpoch(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.epoch();
  }

  async getBondOraclePriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBondPremiumRate();
  }

  /**
   * Buy bonds with cash.
   * @param amount amount of cash to purchase bonds with.
   */
  async buyBonds(amount: string | number): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const basedPrice = await Treasury.getBasedPrice();
    return await Treasury.buyBonds(decimalToBalance(amount), basedPrice);
  }

  /**
   * Redeem bonds for cash.
   * @param amount amount of bonds to redeem.
   */
  async redeemBonds(amount: string): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const basedPrice = await Treasury.getBasedPrice();
    return await Treasury.redeemBonds(decimalToBalance(amount), basedPrice);
  }

  async getBasedTresuryBalance(): Promise<BigNumber> {
    return new Promise((resolve) => {
      resolve(BigNumber.from('1000000000000000000000'));
    });
  }

  async getTotalValueLocked(): Promise<Number> {
    let totalValue = 0;
    for (const bankInfo of Object.values(bankDefinitions)) {
      if( !bankInfo.isEnabled )
      continue;
    
      const pool = this.contracts[bankInfo.contract];
      const token = this.externalTokens[bankInfo.depositTokenName];
      const tokenPrice = await this.getDepositTokenPriceInDollars(bankInfo.depositTokenName, token);

      if (bankInfo.contract.endsWith('GenesisRewardPool')) {
        continue;
      }

      if( bankInfo.depositTokenName === "GodNft" ){
        const stakeInPool = await this.externalTokens[bankInfo.depositTokenName].balanceOf(pool.address);
        const tokenAmountInPool =  (stakeInPool).toNumber(); //WE COUNT WHAT STACKED!!!
        const value =  Number(tokenAmountInPool) * Number(tokenPrice);
        const poolValue = Number.isNaN(value) ? 0 : value;
        totalValue += poolValue;
      } else {
        const tokenAmountInPool = await token.balanceOf(pool.address);
        const value = Number(getDisplayBalance(tokenAmountInPool, token.decimal)) * Number(tokenPrice);
        const poolValue = Number.isNaN(value) ? 0 : value;
        totalValue += poolValue;
      }
    }

    const smeltPrice = (await this.getSmeltStat()).priceInDollars;
    const boardroombShareBalanceOf = await this.SMELT.balanceOf(this.currentBoardroom().address);
    const boardroomTVL = Number(getDisplayBalance(boardroombShareBalanceOf, this.SMELT.decimal)) * Number(smeltPrice);
    totalValue += boardroomTVL;

    for (const profInfo of Object.values(twistedNodes)) {
      const contract = this.contracts[profInfo.nodeName];
      if( contract ){
        totalValue += Number(getDisplayBalance(await contract.totalRewardDebtInDollars(), 6))
      }
    }

    return totalValue; 
  }

  /**
   * Calculates the price of an LP token
   * Reference https://github.com/DefiDebauchery/discordpricebot/blob/4da3cdb57016df108ad2d0bb0c91cd8dd5f9d834/pricebot/pricebot.py#L150
   * @param lpToken the token under calculation
   * @param token the token pair used as reference (the other one would be TOMB in most cases)
   * @param isBased sanity check for usage of based token or bShare
   * @returns price of the LP token
   */
  async getLPTokenPrice(lpToken: ERC20, token: ERC20, isBased: boolean): Promise<string> {
    const totalSupply = getFullDisplayBalance(await lpToken.totalSupply(), lpToken.decimal);
    //Get amount of tokenA
    const tokenSupply = getFullDisplayBalance(await token.balanceOf(lpToken.address), token.decimal);
    const stat = isBased === true ? await this.getObolStat() : await this.getSmeltStat();
    const priceOfToken = stat.priceInDollars;
    const tokenInLP = Number(tokenSupply) / Number(totalSupply);

    const tokenPrice = (Number(priceOfToken) * tokenInLP * 2) //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
      .toString();
    return tokenPrice;
  }

    /**
   * Calculates the price of an LP token
   * Reference https://github.com/DefiDebauchery/discordpricebot/blob/4da3cdb57016df108ad2d0bb0c91cd8dd5f9d834/pricebot/pricebot.py#L150
   * @param lpToken the token under calculation
   * @param token the token pair used as reference (the other one would be TOMB in most cases)
   * @param isBased sanity check for usage of based token or bShare
   * @returns price of the LP token
   */
     async getLPObolSmeltTokenPrice(lpToken: ERC20, token: ERC20, isBased: boolean): Promise<string> {
      const totalSupply = getFullDisplayBalance(await lpToken.totalSupply(), lpToken.decimal);
      //Get amount of tokenA
      const tokenSupply = getFullDisplayBalance(await token.balanceOf(lpToken.address), token.decimal);
      const stat = isBased === true ? await this.getObolStat() : await this.getSmeltStat();
      const priceOfToken = stat.priceInDollars;
      const tokenInLP = Number(tokenSupply) / Number(totalSupply);
      const tokenPrice = (Number(priceOfToken) * tokenInLP * 2) //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
        .toString();
      return tokenPrice;
    }

  async earnedFromBank(
    poolName: ContractName,
    earnTokenName: String,
    poolId: Number,
    account = this.myAccount,
  ): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      if (earnTokenName === 'OBOL' && poolId >= 1) {
        return await pool.pendingOBOL(poolId, account);
      } else if (earnTokenName === 'OBOL' && poolId === 0) {
        return await pool.pendingOBOLNft(poolId, account);
      } else if( earnTokenName === 'SMELT' && poolId >= 1) {
        return await pool.pendingSMELT(poolId, account); //TODO
      } else if (earnTokenName === 'SMELT' && poolId === 0) {
        return await pool.pendingSMELTNft(poolId, account);
      } else {
        return await pool.pendingShare(poolId, account);
      }
    } catch (err) {
      console.error(`Failed to call earned() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0);
    }
  }

  async stakedBalanceOnBank(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      let userInfo = await pool.userInfo(poolId, account);
      return await userInfo.amount;
    } catch (err) {
      console.error(`Failed to call balanceOf() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0);
    }
  }

  /**
   * Deposits token to given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
   async stakeNFT(poolName: ContractName, poolId: Number, amount: any[]): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.StakeNft(poolId, amount);
  }

    /**
   * Withdraws token from given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
     async unstakeNFT(poolName: ContractName, poolId: Number, amount: any[]): Promise<TransactionResponse> {
      const pool = this.contracts[poolName];
      return await pool.UnstakeNft(poolId, amount);
    }

  /**
   * Deposits token to given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async stake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.deposit(poolId, amount);
  }

  /**
   * Withdraws token from given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async unstake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.withdraw(poolId, amount);
  }

    /**
   * Transfers earned token reward from given pool to my account NFT.
   */
     async claimRewardsNFT(poolName: ContractName, poolId: Number): Promise<TransactionResponse> {
      const pool = this.contracts[poolName];
      //By passing 0 as the amount, we are asking the contract to only redeem the reward and not the currently staked token
      return await pool.claimRewardNft(poolId);
    }
  

  /**
   * Transfers earned token reward from given pool to my account.
   */
  async harvest(poolName: ContractName, poolId: Number): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    //By passing 0 as the amount, we are asking the contract to only redeem the reward and not the currently staked token
    return await pool.withdraw(poolId, 0);
  }

  /**
   * Harvests and withdraws deposited tokens from the pool.
   */
  async exit(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    let userInfo = await pool.userInfo(poolId, account);
    return await pool.withdraw(poolId, userInfo.amount);
  }

  async fetchBoardroomVersionOfUser(): Promise<string> {
    return 'latest';
  }

  async fetchParthenonVersionOfUser(): Promise<string> {
    return 'latest';
  }

  currentBoardroom(): Contract {
    if (!this.BoardroomVersionOfUser) {
      //throw new Error('you must unlock the wallet to continue.');
    }
    return this.contracts.Boardroom;
  }

  isOldBoardroomMember(): boolean {
    return this.BoardroomVersionOfUser !== 'latest';
  }

  async getTokenPriceInTomb(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { chainId } = this.config;
    const { TOMB } = this.config.externalTokens;

    const tomb = new Token(chainId, TOMB[0], TOMB[1]);
    const token = new Token(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const tombToToken = await Fetcher.fetchPairData(tomb, token, this.provider);
      const priceInBUSD = new Route([tombToToken], token);

      return priceInBUSD.midPrice.toFixed(4);
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getTokenPriceInFtmShort(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { chainId } = this.config;
    const { WFTM } = this.config.externalTokens;

    const wftm = new Token(chainId, WFTM[0], WFTM[1]);
    const token = new Token(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const ftmToToken = await Fetcher.fetchPairData(wftm, token, this.provider);
      const priceInBUSD = new Route([ftmToToken], token);

      return priceInBUSD.midPrice.toFixed(4);
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getTokenPriceInFtm(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { chainId } = this.config;

    const { WFTM } = this.externalTokens;

    const ftm = new UniToken(chainId, WFTM.address, WFTM.decimal);
    const token = new UniToken(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const ftmToToken = new Pair(UniCurrencyAmount.fromRawAmount(ftm, "0"),
          UniCurrencyAmount.fromRawAmount(token, "0"));

      const liquidityToken = ftmToToken.liquidityToken;
      let ftmBalanceInLP = await WFTM.balanceOf(liquidityToken.address);

      let ftmAmount = Number(getFullDisplayBalance(ftmBalanceInLP, WFTM.decimal));
      let tokenBalanceInLP = await tokenContract.balanceOf(liquidityToken.address);
      let tokenAmount = Number(getFullDisplayBalance(tokenBalanceInLP, tokenContract.decimal));
      // const priceOfOneTombInFtm = await this.getOneTOMBPriceInFTM();
      let priceOftoken = (ftmAmount / tokenAmount);
      return Number(priceOftoken).toString();
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getOneTOMBPriceInFTM(): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { WFTM, TOMB } = this.externalTokens;
    try {
      const ftm_tomb_lp_pair = this.externalTokens['FTM-TOMB-LP'];
      let tomb_amount_BN = await TOMB.balanceOf(ftm_tomb_lp_pair.address);
      let tomb_amount = Number(getFullDisplayBalance(tomb_amount_BN, TOMB.decimal));
      let ftm_amount_BN = await WFTM.balanceOf(ftm_tomb_lp_pair.address);
      let ftm_amount = Number(getFullDisplayBalance(ftm_amount_BN, WFTM.decimal));
      return (ftm_amount / tomb_amount).toString();
    } catch (err) {
      console.error(`Failed to fetch token price of TOMB: ${err}`);
    }
  }

  async getFTMPriceInDollars(): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { WFTM, USDC } = this.externalTokens;
    try {
      const usdc_ftm_lp_pair = this.externalTokens['FTM-USDC-LP'];
      let ftm_amount_BN = await WFTM.balanceOf(usdc_ftm_lp_pair.address);
      let ftm_amount = Number(getFullDisplayBalance(ftm_amount_BN, WFTM.decimal));
      let usdc_amount_BN = await USDC.balanceOf(usdc_ftm_lp_pair.address);
      let usdc_amount = Number(getFullDisplayBalance(usdc_amount_BN, USDC.decimal));
      return (usdc_amount / ftm_amount).toString();
    } catch (err) {
      console.error(`Failed to fetch token price of WFTM: ${err}`);
    }
  }

  //===================================================================
  //===================================================================
  //===================== Boardroom METHODS =============================
  //===================================================================
  //===================================================================

  async getBoardroomAPR() {
    const { Treasury } = this.contracts;

    const Boardroom = this.currentBoardroom();
    const BSHAREPrice = (await this.getSmeltStat()).priceInDollars;
    const BASEDPrice = (await this.getObolStat()).priceInDollars;

    const obolCirculatingSupply = Number((await this.getObolStat()).circulatingSupply)
    const infinitePrinterApr = Number(await Treasury.maxSupplyExpansionPercent());
  
    const BoardroombShareBalanceOf = await this.SMELT.balanceOf(Boardroom.address);
    const BoardroomTVL = Number(getDisplayBalance(BoardroombShareBalanceOf, this.SMELT.decimal)) * Number(BSHAREPrice);
    const realAPR = ((obolCirculatingSupply * Number(BASEDPrice) * infinitePrinterApr) / 10000) / BoardroomTVL * 80 * 365;

    return realAPR;
  }

  async getTokenPerShareBoardroom() {
    const { Treasury } = this.contracts;

    const Boardroom = this.currentBoardroom();
    const infinitePrinterApr = Number(await Treasury.maxSupplyExpansionPercent());
    
    const obolCirculatingSupply = Number((await this.getObolStat()).circulatingSupply)
    const BoardroombShareBalanceOf = await this.SMELT.balanceOf(Boardroom.address);


    const nextPrintAmount = obolCirculatingSupply * infinitePrinterApr / 10000;
    let obolPerSmelt = nextPrintAmount*0.8 / Number(getDisplayBalance(BoardroombShareBalanceOf, this.SMELT.decimal));
    // obolPerSmelt = obolPerSmelt * 0.8;
    return obolPerSmelt;
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Boardroom
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserClaimRewardFromBoardroom(): Promise<boolean> {
    const Boardroom = this.currentBoardroom();
    return await Boardroom.canClaimReward(this.myAccount);
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Boardroom
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserUnstakeFromBoardroom(): Promise<boolean> {
    const Boardroom = this.currentBoardroom();
    const canWithdraw = await Boardroom.canWithdraw(this.myAccount);
    const stakedAmount = await this.getStakedSharesOnBoardroom();
    const notStaked = Number(getDisplayBalance(stakedAmount, this.SMELT.decimal)) === 0;
    const result = notStaked ? true : canWithdraw;
    return result;
  }

  async timeUntilClaimRewardFromBoardroom(): Promise<BigNumber> {
    // const Boardroom = this.currentBoardroom();
    // const mason = await Boardroom.masons(this.myAccount);
    return BigNumber.from(0);
  }

  async getTotalStakedInBoardroom(): Promise<BigNumber> {
    const Boardroom = this.currentBoardroom();
    return await Boardroom.totalSupply();
  }

  async stakeShareToBoardroom(amount: string): Promise<TransactionResponse> {
    if (this.isOldBoardroomMember()) {
      throw new Error("you're using old Boardroom. please withdraw and deposit the BSHARE again.");
    }
    const Boardroom = this.currentBoardroom();
    return await Boardroom.stake(decimalToBalance(amount));
  }

  async getStakedSharesOnBoardroom(): Promise<BigNumber> {
    const Boardroom = this.currentBoardroom();
    if (this.BoardroomVersionOfUser === 'v1') {
      return await Boardroom.getShareOf(this.myAccount);
    }
    return await Boardroom.balanceOf(this.myAccount);
  }

  async getEarningsOnBoardroom(): Promise<BigNumber> {
    const Boardroom = this.currentBoardroom();
    if (this.BoardroomVersionOfUser === 'v1') {
      return await Boardroom.getCashEarningsOf(this.myAccount);
    }
    return await Boardroom.earned(this.myAccount);
  }

  async withdrawShareFromBoardroom(amount: string): Promise<TransactionResponse> {
    const Boardroom = this.currentBoardroom();
    return await Boardroom.withdraw(decimalToBalance(amount));
  }

  async harvestCashFromBoardroom(): Promise<TransactionResponse> {
    const Boardroom = this.currentBoardroom();
    if (this.BoardroomVersionOfUser === 'v1') {
      return await Boardroom.claimDividends();
    }
    return await Boardroom.claimReward();
  }

  async exitFromBoardroom(): Promise<TransactionResponse> {
    const Boardroom = this.currentBoardroom();
    return await Boardroom.exit();
  }

  async getTreasuryNextAllocationTime(): Promise<AllocationTime> {
    const { Treasury } = this.contracts;
    const nextEpochTimestamp: BigNumber = await Treasury.nextEpochPoint();
    const nextAllocation = new Date(nextEpochTimestamp.mul(1000).toNumber());
    const prevAllocation = new Date(Date.now());

    return { from: prevAllocation, to: nextAllocation };
  }

  async uiAllocate(): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    return await Treasury.allocateSeigniorage();
  }

  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to claim
   * their reward from the Boardroom
   * @returns Promise<AllocationTime>
   */
  async getUserClaimRewardTime(): Promise<AllocationTime> {
    const { Boardroom, Treasury } = this.contracts;
    const nextEpochTimestamp = await Boardroom.nextEpochPoint(); //in unix timestamp
    const currentEpoch = await Boardroom.epoch();
    const Ecclesiaseat = await Boardroom.demos(this.myAccount);
    const startTimeEpoch = Ecclesiaseat.epochTimerStart;
    const period = await Treasury.PERIOD();
    const periodInHours = period / 60 / 60; // 6 hours, period is displayed in seconds which is 21600
    const rewardLockupEpochs = await Boardroom.rewardLockupEpochs();
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(rewardLockupEpochs);

    const fromDate = new Date(Date.now());
    if (targetEpochForClaimUnlock - currentEpoch <= 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - currentEpoch - 1;
      const endDate = moment(toDate)
        .add(delta * periodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to unstake
   * from the Boardroom
   * @returns Promise<AllocationTime>
   */
  async getUserUnstakeTime(): Promise<AllocationTime> {
    const { Boardroom, Treasury } = this.contracts;
    const nextEpochTimestamp = await Boardroom.nextEpochPoint();
    const currentEpoch = await Boardroom.epoch();
    const Ecclesiaseat = await Boardroom.demos(this.myAccount);
    const startTimeEpoch = Ecclesiaseat.epochTimerStart;
    const period = await Treasury.PERIOD();
    const PeriodInHours = period / 60 / 60;
    const withdrawLockupEpochs = await Boardroom.withdrawLockupEpochs();
    const fromDate = new Date(Date.now());
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(withdrawLockupEpochs);
    const stakedAmount = await this.getStakedSharesOnBoardroom();
    if (currentEpoch <= targetEpochForClaimUnlock && Number(stakedAmount) === 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - Number(currentEpoch) - 1;
      const endDate = moment(toDate)
        .add(delta * PeriodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  //TODO add proper icons
  async watchAssetInMetamask(assetName: string, contract?: ERC20): Promise<boolean> {
    const { ethereum } = window as any;
    if (ethereum && ethereum.networkVersion === config.chainId.toString()) {
      let asset;
      let assetUrl;
      if (assetName === 'BASED') {
        asset = this.BASED;
        assetUrl = window.location.origin + '/based.svg';
      } else if (assetName === 'BSHARE') {
        asset = this.BSHARE;
        assetUrl = window.location.origin + '/bshare.svg';
      } else if (assetName === 'TOMB') {
        asset = this.TOMB;
        assetUrl = window.location.origin + '/tomb.svg';
      } else if (assetName === 'SOLID') {
        asset = this.SOLID;
        assetUrl = window.location.origin + '/solidly.png';
      } else if (assetName === 'TSHARE') {
        asset = this.TSHARE;
        assetUrl = window.location.origin + '/tshare.svg';
      } else if (assetName === 'BBOND') {
        asset = this.BBOND;
        assetUrl = window.location.origin + '/bbond.svg';
      }
      else if (assetName === 'SMELT') {
        asset = this.SMELT;
        assetUrl = window.location.origin + '/smelt.svg';
      }
      else if (assetName === 'OBOL') {
        asset = this.OBOL;
        assetUrl = window.location.origin + '/obol.svg';
      }
      else if (assetName === 'WFTM') {
        asset = this.FTM;
        assetUrl = window.location.origin + '/ftm.svg';
      }
      else if (assetName === 'USDC') {
        asset = this.USDC;
        assetUrl = window.location.origin + '/usdc.svg';
      }
      else{
        if( contract ){
          asset = contract;
          assetUrl = window.location.origin + '/decorativeToken.png';
        }
        else
          return;
      }
      
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: asset.address,
            symbol: asset.symbol,
            decimals: asset.decimal,
            image: assetUrl,
          },
        },
      });
    }
    return true;
  }

  getEventsLength() : number
  {
    return this.BoardroomFundEvents.length;
  }

  /**
   * @returns an array of the regulation events till the most up to date epoch
   */
  async listenForRegulationsEvents(page: number, rowsPerPage: number): Promise<any> {
    const { Treasury } = this.contracts;
    const treasuryDevFundedFilter = Treasury.filters.BoardroomFunded();
    const treasuryDaoFundedFilter = Treasury.filters.ProtocolFundFunded();
    const treasuryTeamFundedFilter = Treasury.filters.TeamFundFunded();
    // const boughtBondsFilter = Treasury.filters.BoughtBonds();
    // const redeemBondsFilter = Treasury.filters.RedeemedBonds();

    var events: any[] = [];

    let perPage = rowsPerPage;
    //At this moment we download all possible Boardroom fund events. For pagination we should slice array by index
    //startPageAddress is a start index of event's array.
    let startPageAddress = rowsPerPage;
    let endPageAddress = page * perPage;

    if( page > 0 )
      startPageAddress = perPage * (page + 1) ;

    //Start block is always one 30460397 in BoardroomFundEvents
    let firstEpochBlockPerHistory = 30460397;
    let eva: Array<Event>;
    eva = [];

    let currentEpoch = Number( await this.getCurrentEpoch());
    let epochBlocksRanges: any[] = [];

    if( this.BoardroomFundEvents.length == 0 || currentEpoch != this.lastEpoch)
    {
      const treasuryBoardroomFundedFilter = Treasury.filters.BoardroomFunded();
      this.BoardroomFundEvents = await Treasury.queryFilter(treasuryBoardroomFundedFilter, firstEpochBlockPerHistory,  "latest");
      this.lastEpoch = currentEpoch;
    }

    //Something went wrong
    if( this.BoardroomFundEvents.length === 0 ) {
      console.error("Boardroom fund events length = 0");
      return events;
    }

    if(this.BoardroomFundEvents.length < startPageAddress ) {
      startPageAddress = this.BoardroomFundEvents.length;
    }

    eva = this.BoardroomFundEvents.slice(this.BoardroomFundEvents.length - startPageAddress,
        this.BoardroomFundEvents.length - endPageAddress);

    let firstEpochTime = this.BoardroomFundEvents[0].args.timestamp;
    let firstBlockNum = eva[0].blockNumber;

    let lastBlockNum = 0;

    eva.forEach(function callback(value, index) {
      let currentTimeStamp = value.args.timestamp;
      let basedEpoch = 21600;

      events.push({ epoch: Math.round((currentTimeStamp - firstEpochTime) / basedEpoch) + 1});
      // }
      events[index].BoardroomFund = getDisplayBalance(value.args[1]);

      if (index === 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughBonds: 0,
          redeemedBonds: 0,
        });
      }
      if (index > 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughBonds: 0,
          redeemedBonds: 0,
        });

        epochBlocksRanges[index - 1].endBlock = value.blockNumber;
        lastBlockNum = value.blockNumber;
      }
    });

    //Usually for the last epoch we set undefined but for other pages where the epoch is not the last we have to set the existing block number
    if( page > 0 )
    {
      epochBlocksRanges[epochBlocksRanges.length - 1].endBlock = this.BoardroomFundEvents[this.BoardroomFundEvents.length - startPageAddress].blockNumber;
    }
    let DEVFundEvents = await Treasury.queryFilter(treasuryDevFundedFilter, firstBlockNum , lastBlockNum);
    DEVFundEvents.forEach(function callback(value, index) {
      events[index].devFund = getDisplayBalance(value.args[1]);
    });

    let DAOFundEvents = await Treasury.queryFilter(treasuryDaoFundedFilter, firstBlockNum , lastBlockNum);
    DAOFundEvents.forEach(function callback(value, index) {
      events[index].daoFund = getDisplayBalance(value.args[1]);
    });

    let TeamFundEvents = await Treasury.queryFilter(treasuryTeamFundedFilter, firstBlockNum , lastBlockNum);
    TeamFundEvents.forEach(function callback(value, index) {
      events[index].teamFund = getDisplayBalance(value.args[1]);
    });

    return events;
  }


 
    /**
   * Zap-in Helper method
   * @param tokenName token for LP
   * @param lpName LP that is being created
   * @param amount amount of token for LP
   */
     async estimateSmeltObolFtmZapIn(tokenName: string, lpName: string, amount: string): Promise<number[]> {
      const { SmeltObolFtmZap } = this.contracts;
      const lpToken = this.externalTokens[lpName];
      let estimate;
      let token: ERC20;
      switch (tokenName) {
        case WFTM_TICKER:
          token = this.WFTM;
          break;
        case FTM_TICKER:
          token = this.FTM;
          break;
        case OBOL_TICKER:
          token = this.OBOL;
          break;
        case SMELT_TICKER:
          token = this.SMELT;
          break;
        default:
          token = this.SMELT;
      }

      estimate = await SmeltObolFtmZap.estimateZapIn(
        lpToken.address,
        SPOOKY_ROUTER_ADDR,
        parseUnits(amount, 18),
      );
      return [estimate[0] / 1e18, estimate[1] / 1e18];
    }

  async obolFtmZapIn(
    lpName: string,
    tokenName: string,
    tokenName1: string,
    amountToken0: string,
    amountToken1: string,
    minTokenAmount: string,
  ): Promise<TransactionResponse> {
    const { SmeltObolFtmZap } = this.contracts;
    const lpToken = this.externalTokens[lpName];
    let token: ERC20;
    switch (tokenName) {
      case WFTM_TICKER:
        token = this.WFTM;
        break;
      case FTM_TICKER:
        token = this.FTM;
        break;
      case SMELT_TICKER:
        token = this.SMELT;
        break;
      case OBOL_TICKER:
        token = this.OBOL;
        break;
      default:
        token = this.OBOL;
    }

    let token1: ERC20;
    switch (tokenName1) {
      case WFTM_TICKER:
        token1 = this.WFTM;
        break;
      case FTM_TICKER:
        token1 = this.FTM;
        break;
      case SMELT_TICKER:
        token1 = this.SMELT;
        break;
      case OBOL_TICKER:
        token1 = this.OBOL;
        break;
      default:
        token1 = this.OBOL;
    }

    if( tokenName === FTM_TICKER  ){
      const options = {value: ethers.utils.parseEther(amountToken0)}

      return await SmeltObolFtmZap.zapInTokensETH(
        token1.address,
        parseUnits(amountToken1),
        SPOOKY_ROUTER_ADDR,
        this.myAccount,
        parseUnits(minTokenAmount, 18),
        options
      );
    }

    return await SmeltObolFtmZap.zapInTokens(
      token.address,
      token1.address,
      parseUnits(amountToken0, 18),
      parseUnits(amountToken1, 18),
      SPOOKY_ROUTER_ADDR,
      this.myAccount,
      parseUnits(minTokenAmount, 18),
    );
  }

  async obolSmeltFtmZapOut(
    lpName: string,
    amount: string,
    zapOutTokenName: string,
  ): Promise<TransactionResponse> {
    const { SmeltObolFtmZap } = this.contracts;
    const lpToken = this.externalTokens[lpName];

    return await SmeltObolFtmZap.zapOutToTokenEth(
      lpToken.address,
      parseUnits(amount, 18),
      SPOOKY_ROUTER_ADDR,
      this.myAccount,
    );
  }

  getTokenFromTicker(ticker: string): any {
    switch (ticker) {
      case TICKER.BSHARE:
        return this.BSHARE;
      case TICKER.USDC:
        return this.USDC;
      case TICKER.TOMB:
        return this.TOMB;
      case TICKER.BSHARE:
        return this.BSHARE;
      case TICKER.FTM:
        return this.FTM;
      case TICKER.WFTM:
        return this.WFTM;
      case TICKER.BBOND:
        return this.BBOND;
      case TICKER.SMELT:
        return this.SMELT;
      case TICKER.BSHARE_FTM_LP:
        return this.BSHARE_FTM_LP;
      case TICKER.BASED:
      default:
        return this.BASED;
    }
  }

  async getExternalTokenBalanceByName(tokenName: string, account: string): Promise<BigNumber> {
    let contract = this.externalTokens[tokenName];
    if (!contract && !account) return BigNumber.from(0);
    return await contract.balanceOf(account);
  }

  // added line breaks to make it a round number of 1k lines :))
}
