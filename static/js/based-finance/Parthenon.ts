import { BasedFinance } from './BasedFinance';
import { parseUnits } from 'ethers/lib/utils';
import { BigNumber, Contract, ethers } from 'ethers';
import { TransactionResponse } from '@ethersproject/providers';
import {
  ParthenonPoolStat,
  ParthenonRewardPoolStat, ParthenonTotalPoolStat,
  ProfitDistributionInfo,
  ProfitDistributionRewardStat,
  ProfitDistributionStat
} from './types';
import {getDisplayBalance, getFullDisplayBalance} from '../utils/formatBalance';

import axios from 'axios';
import _ from 'lodash';

export class Parthenon {
  basedFinance: BasedFinance;
  contracts: { [name: string]: Contract };
  contractsCustomAbi: { [name: string]: Contract };
  parthenonPoolStats: {[name: string]: ParthenonPoolStat};
  parthenonRewardPoolStats: {[name: string]: ParthenonRewardPoolStat};
  profitDistributionsStats: {[name: string]: ProfitDistributionStat};

  constructor(basedFinance: BasedFinance) {
    this.basedFinance = basedFinance;
    this.contracts = {};
    this.contractsCustomAbi = {};
    this.parthenonPoolStats = {};
    this.parthenonRewardPoolStats = {};
    this.profitDistributionsStats = {};
  }

  get isUnlocked(): boolean {
    return !!this.basedFinance.myAccount;
  }

  async getStakedSharesOnParthenon(profitDistributionName: string): Promise<BigNumber> {
    const Parthenon = this.basedFinance.contracts[profitDistributionName];
    if (!Parthenon) return;
    return await Parthenon.userInfo(this.basedFinance.myAccount);
  }

  async profDistStake(profitDistributionName: string, amount: string): Promise<TransactionResponse> {
    const Parthenon = this.basedFinance.contracts[profitDistributionName];
    if (!Parthenon) return;
    return await Parthenon.stakeTokens(parseUnits(amount, 18));
  }

  async profDistWithdraw(profitDistributionName: string, amount: string): Promise<TransactionResponse> {
    const Parthenon = this.basedFinance.contracts[profitDistributionName];
    if (!Parthenon) return;
    return await Parthenon.unstakeTokens(parseUnits(amount, 18));
  }

  async getProfitDsitributionStat(profitDistribution: ProfitDistributionInfo, account: string): Promise<ProfitDistributionStat> {
    if (account === undefined) return;

    const Parthenon = this.basedFinance.contracts[profitDistribution.contract];
    let info = await Parthenon.userInfo(account);

    let profitDistributionStat = {
      balance: info.balance,
      lastStakedTime: info.lastStakedTime,
      depFee: await Parthenon.depositFee(),
      maxWithdrawFee: await Parthenon.maxWithdrawFee(),
      feePeriod: await Parthenon.feePeriod(),
      totalBurned: await Parthenon.totalBurned(),
      totalStacked: await Parthenon.totalStaked(),
    }
    this.profitDistributionsStats[profitDistribution.name] = profitDistributionStat;

    return profitDistributionStat;
  }

  async getDepositContractDecimal(depositTokenName: string): Promise<number> {
    const Contract = this.basedFinance.externalTokens[depositTokenName];
    return Contract.decimal;
  }

  async getRewardInfo(
    index: number,
    profitDistributionName: string,
    account: string,
  ): Promise<ProfitDistributionRewardStat> {
    const profitDistrubution = this.basedFinance.contracts[profitDistributionName];
    return {
      rewardsPerEpoch: (await profitDistrubution.rewardInfo(index))[1],
      distributedAmount: (await profitDistrubution.rewardInfo(index)).distributedAmount,
      totalRewards: (await profitDistrubution.rewardInfo(index))[2],
      earned: await profitDistrubution.earned(account, index),
    };
  }

  async getProfitDistributionRewardInfo(
    length: number,
    profitDistributionName: string,
    account: string,
  ): Promise<ProfitDistributionRewardStat[]> {
    if (!account) return;
    let rewardsInfo: ProfitDistributionRewardStat[] = [];
    for (let i = 0; i < length; i++) {
      rewardsInfo.push(await this.getRewardInfo(i, profitDistributionName, account));
    }
    return rewardsInfo;
  }

  async getRewardPriceInDollars(tokenID: string): Promise<number> {
    if (tokenID.length === 0) return 0;
    const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenID}&vs_currencies=usd`);
    const price = _.get(res.data, [tokenID, 'usd']);
    if (price === undefined) return 0;
    return price;
  }

  async getRewardsPriceInDollars(profitDistributionInfo: ProfitDistributionInfo): Promise<number[]> {
    let rewardsPrices: number[] = [];

    for (let i = 0; i < profitDistributionInfo.rewardTokensName.length; i++) {
      rewardsPrices.push(await this.getRewardPriceInDollars(profitDistributionInfo.rewardTokensName[i].apiPriceID));
    }
    return rewardsPrices;
  }

  async getPricePerShareAbi(depositToken: string, abi: any[]): Promise<number> {
    if (abi.length === 0) return 0;

    const externalToken = this.basedFinance.externalTokens[depositToken];

    if (!externalToken) return 0;

    let contract = this.contractsCustomAbi[depositToken];
    if (!contract) {
      console.log('Contract not found/ init new');
      contract = new ethers.Contract(externalToken.address, abi, this.basedFinance.provider);
      if (!contract) return 0;
      this.contractsCustomAbi[depositToken] = contract;
    }

    //TODO Refactor required. pick price another way
    const tokenPricePerShare = Number(getDisplayBalance(await contract.getPricePerFullShare(), 18));
    return tokenPricePerShare;
  }

  async getPriceLPStats(lpName: string): Promise<number> {
    //TODO Refactor required. pick price another way
    // if (lpName === 'BASED-TOMB-LP') {
    //   const basedTombLpStats = await this.basedFinance.getTombLPStat('BASED-TOMB-LP');
    //   return Number(basedTombLpStats.priceOfOne);
    // }
    return 0;
  }

  async profitDistributionClaim(profitDistributionName: string): Promise<TransactionResponse> {
    const Parthenon = this.basedFinance.contracts[profitDistributionName];
    if (!Parthenon) return;
    return await Parthenon.collectRewards();
  }

  async getParthenonPoolStat(profitDistributionStat: ProfitDistributionStat,
                             profitDistributionInfo: ProfitDistributionInfo): Promise<ParthenonPoolStat>
  {
    let depositTokenPricePerShare: number = 0;
    if( profitDistributionInfo.depositTokenAbi )
    {
      depositTokenPricePerShare = await this.getPricePerShareAbi(
          profitDistributionInfo.depositTokenName,
          profitDistributionInfo.depositTokenAbi);
    }
    else
    {
      //TODO another way
      console.error("Another way to handle Price per share. Not ready yet!")
      return;
    }

    const depositContractDecimals = await this.getDepositContractDecimal(profitDistributionInfo.depositTokenName);

    let stakedAmount = Number(getFullDisplayBalance(profitDistributionStat.balance, depositContractDecimals));
    const allTokenAmountBurned = Number(getDisplayBalance(profitDistributionStat.totalBurned, 18));
    const priceLp = await this.getPriceLPStats(profitDistributionInfo.lpPair);
    const depositAmountInDollars = depositTokenPricePerShare * priceLp * stakedAmount;
    const allTokenAmountBurnedInDollars = allTokenAmountBurned * priceLp * depositTokenPricePerShare;
    const tokenBalance = Number(profitDistributionStat.totalStacked) / 1e18;
    const totalValueLocked = tokenBalance * priceLp * depositTokenPricePerShare;

    let parthenonPoolStat = {
      depositAmountInDollars: depositAmountInDollars,
      allTokenAmountBurnedInDollars: allTokenAmountBurnedInDollars,
      totalValueLocked : totalValueLocked,
      stakedAmount: stakedAmount
    }
    this.parthenonPoolStats[profitDistributionInfo.name] = parthenonPoolStat;

    return parthenonPoolStat;
  }

  async fetchParthenonPoolRewardStat(profitDistributionInfo: ProfitDistributionInfo, account: string): Promise<ParthenonRewardPoolStat>
  {
    const rewardInfo = await this.getProfitDistributionRewardInfo(
        profitDistributionInfo.rewardTokensName.length,
        profitDistributionInfo.contract,
        account
    );
    let totalRewardsInDollars = 0;
    const rewardPricesInDollars: number[] = await this.getRewardsPriceInDollars(profitDistributionInfo);

    if( rewardPricesInDollars.length !== rewardInfo.length ) {
      console.error("Rewards prices lenght !== rewardInfo.length");
      return;
    }

    let activeRewards = 0;
    let earnedRewards = [];
    let totalDistributedRewards = 0;

    for (let i = 0; i < rewardInfo.length; i++) {
      const rewards = rewardInfo[i].totalRewards;
      const usdRewards = Number(rewards) * rewardPricesInDollars[i];
      activeRewards += usdRewards / 1e18;
      totalDistributedRewards +=  Number(getDisplayBalance(BigNumber.from(rewardInfo[i].distributedAmount)));
      totalRewardsInDollars +=
          Number(getDisplayBalance(BigNumber.from(rewardInfo[i].distributedAmount))) * rewardPricesInDollars[i];

      const reward = rewardInfo[i].earned;
      earnedRewards.push(Number(getDisplayBalance(reward, 18)));
    }


    let parthenonRewardPoolStat = {
      totalRewardsInDollars: totalRewardsInDollars,
      activeRewards: activeRewards,
      earnedRewards : earnedRewards,
      rewardPricesInDollars: rewardPricesInDollars,
      totalDistributedRewards : totalDistributedRewards
    }

    this.parthenonRewardPoolStats[profitDistributionInfo.name] = parthenonRewardPoolStat;

    return parthenonRewardPoolStat;
  }

  async getParthenonDepositFee(profitDistributionStat: ProfitDistributionStat): Promise<number>
  {
    return (Number(getDisplayBalance(profitDistributionStat?.depFee, 4)) * 10);
  }
  async calculateParthenonUserTax(profitDistributionStat: ProfitDistributionStat): Promise<string>
  {
    let maxWithdrawFee = 7;
    let feePeriod = 7;
    const lastStakeTime = profitDistributionStat.lastStakedTime * 1000;

    maxWithdrawFee = Number(profitDistributionStat.maxWithdrawFee);
    feePeriod = profitDistributionStat.feePeriod * 1000;

    let userCurrentTax = (
        ((((feePeriod - (Date.now() - lastStakeTime)) * 1e18) / feePeriod) * maxWithdrawFee) /
        1e21
    ).toFixed(2);

    if (Number(userCurrentTax) <= 0) {
      return '0';
    }
    return userCurrentTax;
  }

  async getParthenonTotalProfitStat(activeProfitDistributions: ProfitDistributionInfo[]): Promise<ParthenonTotalPoolStat>
  {
    if( !activeProfitDistributions ) {
      console.log("activeProfitDistributions is undefined");
      return undefined;
    }

    let parthenonPoolStatsSize = Object.keys(this.parthenonPoolStats).length;
    let parthenonPoolRewardsStatsSize = Object.keys(this.parthenonRewardPoolStats).length;


    if( parthenonPoolStatsSize != parthenonPoolRewardsStatsSize )
      return undefined;

    if( activeProfitDistributions.length === parthenonPoolStatsSize )
    {
      let allTokenAmountBurnedInDollars = 0;
      let totalValueLocked = 0;
      let activeRewards = 0;
      let totalRewardsInDollars = 0;
      let allTokenAmountBurned = 0;
      let totalDistributedRewards = 0;

      for( let i = 0; i < parthenonPoolStatsSize; i++ )
      {
        const parthenonPoolStats = this.parthenonPoolStats[activeProfitDistributions[i].name];
        const parthenonPoolRewardsStats = this.parthenonRewardPoolStats[activeProfitDistributions[i].name];
        const profitDistributionsStat = this.profitDistributionsStats[activeProfitDistributions[i].name];


        if( parthenonPoolStats && parthenonPoolRewardsStats && profitDistributionsStat )
        {
          allTokenAmountBurnedInDollars += parthenonPoolStats.allTokenAmountBurnedInDollars;
          totalValueLocked += parthenonPoolStats.totalValueLocked;
          activeRewards += parthenonPoolRewardsStats.activeRewards;
          totalRewardsInDollars += parthenonPoolRewardsStats.totalRewardsInDollars;
          allTokenAmountBurned += Number(getDisplayBalance(profitDistributionsStat.totalBurned, 18));
          totalDistributedRewards += parthenonPoolRewardsStats.totalDistributedRewards;
        }
      }

      this.profitDistributionsStats = {};
      this.parthenonPoolStats = {};
      this.profitDistributionsStats = {};

      return{
        totalValueLocked,
        activeRewards,
        totalRewardsInDollars,
        allTokenAmountBurnedInDollars,
        allTokenAmountBurned,
        totalDistributedRewards
      }
    }
    return undefined;
  }
}
