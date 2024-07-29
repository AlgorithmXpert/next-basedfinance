import { BasedFinance } from './BasedFinance';
import { BigNumber, Contract, ethers } from 'ethers';
import { TransactionResponse } from '@ethersproject/providers';
import { getDisplayBalance, getFullDisplayBalance } from '../utils/formatBalance';
import { SPOOKY_ROUTER_ADDR, TOMBSWAP_ROUTER_ADDR, TICKER, BASED_ROUTER_ADDR } from '../utils/constants';
import { Fetcher, Route, Token } from '@spookyswap/sdk';
import ERC20 from './ERC20';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

export class Katastima {
  basedFinance: BasedFinance;
  constructor(basedFinance: BasedFinance) {
    this.basedFinance = basedFinance;
  }

  /**
   * Get balance of selected token in user's wallet
   * @param selectedTicker selected token ticker
   */
  async getTokenFullBalance(selectedTicker: string): Promise<string> {
    let stat: string = '';
    const selectedToken = this.basedFinance.getTokenFromTicker(selectedTicker);

    const isUnlocked = this.basedFinance?.isUnlocked;

    if (selectedToken && isUnlocked) {
      let tokenBalance: BigNumber = BigNumber.from(0);

      //Need to think about it
      if (selectedTicker === TICKER.BASED) tokenBalance = await this.basedFinance.getBasedTresuryBalance();
      else tokenBalance = await selectedToken.balanceOf(this.basedFinance.myAccount);

      const displayBalance = getFullDisplayBalance(tokenBalance, selectedToken.decimal);
      return displayBalance;
    }
    return stat;
  }

  /**
   * Get OTC contract discount percentage
   * @selectedReceiveTicker asset user wants to receive
   */
   async getOtcDiscountValue(selectedReceiveTicker: string): Promise<Number> {
    const { OTC, OTCBSHARE } = this.basedFinance.contracts;
    let otcDiscountValue;
    if (selectedReceiveTicker === 'SMELT') {
      otcDiscountValue = await OTC.CurrentDiscount(); //TODO CHECK
    } else {
      otcDiscountValue = await OTC.CurrentDiscount();
    }
    return otcDiscountValue;
  }


  /**
   * Get total amount of BASED in the OTC contract
   * @selectedReceiveTicker asset user wants to receive
   */
   async getOtcTokensAvailable(selectedReceiveTicker: string): Promise<Number> {
    const { OTCBASED, OTCSMELT, OTC } = this.basedFinance.contracts;
    let tokenAvailable;
    if (selectedReceiveTicker === 'SMELT') {
      tokenAvailable = await this.basedFinance.SMELT.balanceOf(OTC.address);
    } else  {
      tokenAvailable = await this.basedFinance.OBOL.balanceOf(OTCSMELT.address);
    }
    return Number(getDisplayBalance(tokenAvailable, 18));
  }


  /**
   * Get total amount of BASED in the OTC contract
   */
  async getOtcBasedAvailable(selectedTicker: string): Promise<Number> {
    const { OTC } = this.basedFinance.contracts;
    let basedAvailable = await this.basedFinance.SMELT.balanceOf(OTC.address);
    return Number(getDisplayBalance(basedAvailable, 18));
  }

  /**
   * Calculate total money saved compared to pure market swap
   */
  async getTotalMoneySaved(selectedReceiveTicker: string): Promise<Number> {
    const { OTC, OTCSMELT } = this.basedFinance.contracts;

    let totalTokensSwapped: number;
    if (selectedReceiveTicker === 'SMELT') {
      totalTokensSwapped = Number(getDisplayBalance(await OTC.TotalSmeltSwapped(), 18));
      totalTokensSwapped = ((totalTokensSwapped) * 0.1) + 8.93
    }else if( selectedReceiveTicker === 'OBOL') {
      totalTokensSwapped = Number(getDisplayBalance(await OTCSMELT.TotalTokenForSaleSwapped(), 18));
      totalTokensSwapped = ((totalTokensSwapped) * 0.1) 
    }
    
    return totalTokensSwapped;
  }


    /**
   * Get based percentage rate swapped on market
   * @return number
   */
     async getBasedMarketSwapPercentage(): Promise<Number> {
      const { OTC } = this.basedFinance.contracts;
      let marketSwapPercentage = Number(await OTC.MarketSwapPercentage());
      return marketSwapPercentage / 1000;
    }
      /**
   * Get bshare percentage rate swapped on market
   * @return number
   */
  async getBshareMarketSwapPercentage(): Promise<Number> {
    const { OTCBSHARE } = this.basedFinance.contracts;
    let marketSwapPercentage = Number(await OTCBSHARE.MarketSwapPercentage());
    return marketSwapPercentage / 1000;
  }

  
  /**
   * Get percentage rate swapped on market
   */
  async getMarketSwapPercentage(): Promise<Number> {
    const { OTC } = this.basedFinance.contracts;
    let marketSwapPercentage = Number(await OTC.MarketSwapPercentage());
    return marketSwapPercentage / 1000;
  }

  /**
   * Calculate estimated swapped amount
   * @param amount token amount to estimate
   * @param uintPrice price of one token in BASED
   */
  async calculateEstimations(amount: number, uintPrice: number): Promise<number> {
    return uintPrice > 0 ? amount * (1/ uintPrice) : 0;
  }

    /**
   * Calculate the price of 1 token in $
   * @param assetReceived asset user wants to receive
   * @param assetSwapped asset user wants to buy assetReceived with
   * @return priceInUSD: number
   */
     async getUnitPriceInToken(assetReceived: string, assetSwapped: string): Promise<number> {
      const { OTCBASED, OTCSMELT, OTC, OTCBOND } = this.basedFinance.contracts;
      const tokenContract = this.basedFinance.getTokenFromTicker(assetSwapped);
      const tokenAmount = assetSwapped === 'USDC' ? parseUnits('1', 6) : parseUnits('1', 18);

      if (!assetSwapped && !assetReceived) {
        console.error('Selected ticker is iqnvalid!');
        return undefined;
      }


      let selectedTickerOTC: any;

      switch(assetSwapped) {
        case 'BBOND':{
          selectedTickerOTC = OTCBOND;
          break;
        }
        case 'BSHARE-FTM-LP':{
          selectedTickerOTC = OTC;
          break;
        }
        case 'SMELT': {
          selectedTickerOTC = OTCSMELT;
          break;
        }
      }
  
      let assetPerTokenMarket;
      let assetPerTokenOtc;
      let medianAssetAmount;
      switch (assetReceived) {
        case 'SMELT':
          assetPerTokenOtc = Number(
            getDisplayBalance(
              await selectedTickerOTC._estimateOTCSwap(tokenContract.address, tokenAmount, SPOOKY_ROUTER_ADDR),
              18,
              6,
            ),
          );
          medianAssetAmount = assetPerTokenOtc
          break;
        default:
          assetPerTokenOtc = Number(
            getDisplayBalance(
              await selectedTickerOTC._estimateOTCSwap(tokenContract.address, tokenAmount, BASED_ROUTER_ADDR), //FIX FOR BSHARE_LP
              18,
              6,
            ),
          );
          medianAssetAmount = assetPerTokenOtc
      }
  
      const priceInUSD = Number(1 / medianAssetAmount);
      return priceInUSD;
    }

  /**
   * Calculate the price of 1 token in $
   * @param selectedTicker selected token ticker
   */
  async getBasedPriceInToken(selectedTicker: string): Promise<number> {
    const { OTC, OTCBOND, OTCSMELT } = this.basedFinance.contracts;
    
    const tokenContract = this.basedFinance.getTokenFromTicker(selectedTicker);
    const tokenAmount = selectedTicker === 'USDC' ? parseUnits('1', 6) : parseUnits('1', 18);
    const marketSwapPercentage = 0;//await this.getMarketSwapPercentage();
    //const otcSwapPercentage = 1 - marketSwapPercentage.valueOf();
    const router = SPOOKY_ROUTER_ADDR;
    if (!selectedTicker) {
      console.error('Selected ticker is iqnvalid!');
      return undefined;
    }
    // console.log("Token amount: ", tokenAmount.toString());
    // console.log("Token address: ", tokenContract.address);

    let basedPerTokenOtc = Number(0);

    if( selectedTicker === 'BBOND' ){
      basedPerTokenOtc = Number(
        getDisplayBalance(await OTCBOND._estimateOTCSwap(tokenContract.address, tokenAmount, router), 18, 6),
      );
    } else if( selectedTicker === 'SMELT'){
      basedPerTokenOtc = Number(
        getDisplayBalance(await OTCSMELT._estimateOTCSwap(tokenContract.address, tokenAmount, router), 18, 6),
      );
    } 
    else {
      basedPerTokenOtc = Number(
        getDisplayBalance(await OTC._estimateOTCSwap(tokenContract.address, tokenAmount, router), 18, 6),
      );
    }

    const medianBasedAmount = basedPerTokenOtc;

    const priceInUSD = Number(1 / medianBasedAmount);

    return priceInUSD;
  }

  // /**
  //  * OTC swap tokens
  //  * @param amount token amount to swap
  //  * @param ticker token ticker to purchase bonds with
  //  * @param estimateTokenAmount token price estimation from swapTokens
  //  */
  // async instaSwapBond(amount: string, ticker: string, estimateTokenAmount: string): Promise<TransactionResponse> {
  //   const { OTC, OTCBOND } = this.basedFinance.contracts;
  //   let swapToken: ERC20 = this.basedFinance.getTokenFromTicker(ticker);
  //   let swapAmmount = ticker === 'USDC' ? parseUnits(amount, 6) : parseUnits(amount, 18);

  //   if( ticker === 'BBOND' ){
  //     return await OTCBOND.swapToken(
  //       swapToken.address,
  //       swapAmmount,
  //       SPOOKY_ROUTER_ADDR,
  //       parseUnits(Number(estimateTokenAmount).toFixed(8), 18),
  //     );
  //   }

  //   return await OTC.swapToken(
  //     swapToken.address,
  //     swapAmmount,
  //     SPOOKY_ROUTER_ADDR,
  //     parseUnits(Number(estimateTokenAmount).toFixed(8), 18), //TEST
  //   );
  // }

    /**
   * OTC swap tokens
   * @param amount token amount to swap
   * @param assetReceivedTicker asset user wants to receive
   * @param assetSwappedTicker asset user wants to buy assetReceived with
   * @param estimateTokenAmount token price estimation from swapTokens
   */
     async instaSwapBond(
      amount: string,
      assetReceivedTicker: string,
      assetSwappedTicker: string,
      estimateTokenAmount: string,
    ): Promise<TransactionResponse> {
      const { OTC, OTCSMELT } = this.basedFinance.contracts;
      let swapToken: ERC20 = this.basedFinance.getTokenFromTicker(assetSwappedTicker);
      let swapAmmount = assetSwappedTicker === 'USDC' ? parseUnits(amount, 6) : parseUnits(amount, 18);
      
      switch (assetReceivedTicker) {
        case 'OBOL':
          return await OTCSMELT.swapToken(
            swapToken.address,
            swapAmmount,
            BASED_ROUTER_ADDR,
            parseUnits(Number(estimateTokenAmount).toFixed(8), 18),
          );
        default:
          return await OTC.swapToken(
            swapToken.address,
            swapAmmount,
            BASED_ROUTER_ADDR,
            parseUnits(Number(estimateTokenAmount).toFixed(8), 18), //parseUnits(estimateTokenAmount, 18), //
          );
      }
    }

  /**
   * Swap native FTM to OTC token
   * @amount native FTM amount to swap
   */
  async instaSwapBondNative(amount: string): Promise<TransactionResponse> {
    return new Promise((resolve) => {
      //TODO add functionality when can proccess FTM correctly
    });
  }

    /**
   * OTC swap major function
   * @param assetReceivedTicker asset user wants to receive
   * @param assetSwappedTicker asset user wants to buy assetReceived with
   * @param amount token amount to swap
   */
     async swapTokens(
      assetReceivedTicker: string,
      assetSwappedTicker: string,
      amount: string,
    ): Promise<TransactionResponse> {
      const assetReceivedContract = this.basedFinance.getTokenFromTicker(assetReceivedTicker);
      const assetSwappedContract = this.basedFinance.getTokenFromTicker(assetSwappedTicker);
      if (!assetReceivedContract && !assetSwappedContract) {
        console.error('Selected ticker is invalid!');
        return undefined;
      }
  
      let freshTokenPrice = await this.getUnitPriceInToken(assetReceivedTicker, assetSwappedTicker);
      let estimation = await this.calculateEstimations(Number(amount), freshTokenPrice);
      estimation -= estimation * 0.02;
  
      let tx;
      if (assetSwappedTicker === TICKER.FTM) {
        tx = await this.instaSwapBondNative(amount);
      } else {
        tx = await this.instaSwapBond(amount, assetReceivedTicker, assetSwappedTicker, Number(estimation).toString());
      }
  
      return tx;
    }
}
