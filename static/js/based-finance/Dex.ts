import { BasedFinance } from './BasedFinance';
import { BigNumber, Contract, ethers, FixedNumber } from 'ethers';
import { getDefaultProvider } from '../utils/provider';
import { getBalance, getDisplayBalance, getFullDisplayBalance } from '../utils/formatBalance';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import invariant from 'tiny-invariant'
import IUniswapV2PairABI from './IUniswapV2Pair.abi.json';
import IERC20ABI from './ERC20.abi.json';

import ERC20 from './ERC20';

import {Pair,Route,Trade} from './uniswap-based-sdk'
import {CurrencyAmount,Token,Price} from '@uniswap/sdk-core';
import { getCreate2Address } from '@ethersproject/address'
import { pack, keccak256 } from '@ethersproject/solidity'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { createMulticall, Call } from './multicall'

//import {Route} from '@uniswap/sdk';

// import { CurrencyAmount, Fetcher, Fetcher as FetcherSpirit, JSBI, Percent, Route, Token, Token as TokenSpirit,  TokenAmount, Trade, Currency } from '@spookyswap/sdk';



import {
    DexAcountTokenInfo,
    DexDiscountTable,
    DexDiscountTableInfo,
    DexDiscountToken,
    DexLiquidityInfo, DexMyLiquidityInfo,
    DexPairInfo,
    DexSwapInfo,
    DexTokenInfo, DexUserDiscount,
    DexFarmInfo
} from './types';
import  { dexFarms } from '../views/Dex/dexConfig';
import  { dexPairs } from '../views/Dex/dexConfig';
import { TradeType } from '@spiritswap/sdk';
import { ChainId } from '@spookyswap/sdk';
import { toLength } from 'lodash';
import { TransactionResponse } from '@ethersproject/providers';
import { useWallet } from 'use-wallet';

export class Dex {
    basedFinance: BasedFinance;
    dexTokensInfo: DexTokenInfo[];
    dexPairsInfo: { [address: string]: DexPairInfo };
    //dexPairsInfo:Map<string,DexPairInfo>;
    dexPairsToIgnore: { [address: string]: DexPairInfo };
    dexTokens: { [address: string]: DexTokenInfo };
    tokensLength: number;
    discoTables: { [address: string]: DexDiscountTable[] };

    farms: DexFarmInfo[];
    lastPairUpdates: number;

    constructor(basedFinance: BasedFinance) {
        this.basedFinance = basedFinance;
        this.dexTokensInfo = [];
        this.dexPairsInfo = {};
        this.farms = [];
        this.dexPairsToIgnore = {};
        //this.dexPairsInfo = new Map<string, DexPairInfo>()
        this.dexTokens = {};
        this.tokensLength = 0;
        this.lastPairUpdates = 0;
        this.discoTables = {};
        for (const farm of Object.values(dexFarms)) {
            this.farms.push({
                ...farm,
            });
        }
        // }
        for (const pair of Object.values(dexPairs)) {
            this.dexPairsToIgnore[pair.address] = pair;
        }

        // console.log(this.dexTokens)

        // for( let i = 0; i < this.dexTokensInfo.length; i++ ){
        //   let token = this.dexTokensInfo[i];
        //   token.contract =  new ERC20(token.address, this.basedFinance.provider, token.symbol);
        //   this.dexTokens[token.name] = token;
        // }

        // for( let i = 0; i < this.dexPairsInfo.length; i++ ){
        //   let pair = this.dexPairsInfo[i];
        //   let lp = new Contract(pair.address, IUniswapV2PairABI, this.basedFinance.provider);
        //   if( lp ){
        //     pair.contract = lp;
        //     pair.token0 = this.dexTokens[pair.token0Name];
        //     pair.token1 = this.dexTokens[pair.token1Name];
        //   }
        // }


        // console.log(this.dexPairsInfo)
        //Parse Dex config
        //Fill By whitelisted tokens

        //this.getPairs();
    }

    getDexTokens(): DexTokenInfo[] {
        let dexTokensInfo: DexTokenInfo[] = [];
        for (var key in this.dexTokens) {
            if (this.dexTokens.hasOwnProperty(key)) {
                dexTokensInfo.push(this.dexTokens[key]);
            }
        }
        return dexTokensInfo;
    }


    async getPairSupply(pair: DexPairInfo, token0: ERC20, token1: ERC20): Promise<number[]> {
        const ready = await this.basedFinance.provider.ready;
        if (!ready) return;
        try {
            if (!pair || !token0 || !token1)
                return [0, 0];
            let token0Amount_BN = await token0.balanceOf(pair.address);
            let token0Amount = Number(getFullDisplayBalance(token0Amount_BN, token0.decimal));
            let token1Amount_BN = await token1.balanceOf(pair.address);
            let token1Amount = Number(getFullDisplayBalance(token1Amount_BN, token1.decimal));
            return [token0Amount, token1Amount];
        } catch (err) {
            console.error(`Failed to fetch token price of WFTM: ${err}`);
        }
    }

    async getTokenBalance(token: string): Promise<number> {
        if( !token )
            return 0
        try {
            let tokenContract = this.dexTokens[token].contract;
            if (tokenContract) {
                if (token === "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83") {
                    return 0;
                }
                const balance = await tokenContract.balanceOf(this.basedFinance.myAccount);
                return Number(getDisplayBalance(balance, tokenContract.decimal));
            }
        } catch (err) {
            console.error(`Failed to fetch token ${token} balance: ${err}`);
        }
    }

    async getMyWalletTokens(): Promise<DexAcountTokenInfo[]> {
        let dexAccountTokens: DexAcountTokenInfo [] = [];

        // tokenName: string;
        // discount: number;
        // type: number; // 0 - "< 100" ; 1 - "100 - 500"; 2 - "> 500"
        let discountToken: DexDiscountToken = {
            tokenName: "SMELT",
            discount: 1,
            type: 1
        };
        let discountToken2: DexDiscountToken = {
            tokenName: "OBOL",
            discount: 1,
            type: 1
        };


        for (var key in this.dexTokens) {
            if (this.dexTokens.hasOwnProperty(key)) {
                //this.dexTokens[key]
                let token = this.dexTokens[key];
                let discounts: DexDiscountToken [] = [];
                discounts.push(discountToken);
                discounts.push(discountToken2);

                const balance = await token.contract.balanceOf(this.basedFinance.myAccount);
                const balanceNum = Number(getDisplayBalance(balance, token.contract.decimal));
                if (balanceNum === 0)
                    continue;
                let accuontToken: DexAcountTokenInfo = {
                    balance: balanceNum,
                    token: token,
                    totalDiscount: 0,
                    discounts: 0
                }

                dexAccountTokens.push(accuontToken);

            }
        }

        // console.log("Suka " + this.dexTokens.length)
        // if( !this.dexTokens.length )
        //   return [];

        return dexAccountTokens;
    }

    async getDiscountTableInfo(): Promise<DexDiscountTableInfo[]> {
        let discountsTableInfo: DexDiscountTableInfo[] = [];
        let discountInfo: DexDiscountTableInfo = {
            tokenName: "",
            discounts: [],
            header: []
        };
        let discounts: number[] = [0, 0, 0];
        discounts[0] = 0;
        discounts[1] = 1;
        discounts[2] = 2;

        discountInfo.discounts = discounts;
        discountInfo.tokenName = "SMELT";

        discountsTableInfo.push(discountInfo);


        let discountInfo2: DexDiscountTableInfo = {
            tokenName: "",
            discounts: [],
            header: []
        };
        discountInfo2.discounts = discounts;
        discountInfo2.tokenName = "OBOL";

        discountsTableInfo.push(discountInfo2);
        return discountsTableInfo;
    }


    async getAutoRoute(token0: DexTokenInfo, token1: DexTokenInfo, amount: number): Promise<DexTokenInfo[]> {
        // await this.getPairs();
        if (!this.dexTokens.length)
            return []
        return [this.dexTokens["0x14007EC3b333D2c9710F31730c1EF64A86AE3a27"], this.dexTokens["0x14007EC3b333D2c9710F31730c1EF64A86AE3a27"], this.dexTokens["0x14007EC3b333D2c9710F31730c1EF64A86AE3a27"]];
    }

    async testFunc() {

    }


    async getRoute(token1: string, token2: string): Promise<number> {
        // for( let i = 0; i < this.dexPairsInfo.length; i++ ){
        //   let pair = this.dexPairsInfo[i];
        //   this.getPairSupply(pair, pair.token0.contract, pair.token1.contract);
        // }


        // console.log("ROUTE CALCULATE")
        // const tokenAddr1 = this.basedFinance.externalTokens[token1];
        // const tokenAddr2 = this.basedFinance.externalTokens[token2];

        // const tokenAddr3 = this.basedFinance.externalTokens['WFTM'];

        // const SMELT = new Token(250, tokenAddr1.address, tokenAddr1.decimal, 'SMELT', 'SMELT')
        // const USDC = new Token(250, tokenAddr2.address, tokenAddr2.decimal, 'USDC', 'USDC')
        // const FTM = new Token(250, tokenAddr3.address, tokenAddr3.decimal)

        // const SMELT_USDC = new Pair(new TokenAmount(SMELT, JSBI.BigInt(2500)), new TokenAmount(USDC, JSBI.BigInt(1000)))

        // const SMELT_WFTM = new Pair(new TokenAmount(SMELT, JSBI.BigInt(1000)), new TokenAmount(FTM, JSBI.BigInt(1700)))

        // const USDC_WFTM = new Pair(new TokenAmount(USDC, JSBI.BigInt(1000)), new TokenAmount(FTM, JSBI.BigInt(2000)))

        // const NOT_TO_HOT = new Route([SMELT_USDC, SMELT_WFTM], USDC)

        // const amount = CurrencyAmount.ether('1000000000000000000')
        // const trade = new Trade(NOT_TO_HOT, new TokenAmount(USDC, '1000000000000000'), TradeType.EXACT_INPUT)
        // const tt = Trade.bestTradeExactIn([SMELT_WFTM, USDC_WFTM, SMELT_USDC], new TokenAmount(USDC, JSBI.BigInt(10)), SMELT)
        // console.log(tt)


        // console.log(tt[0].inputAmount)
        // console.log(tt[0].outputAmount)
        // console.log(tt[1].inputAmount)
        // console.log(tt[1].outputAmount)

        // console.log(trade)

        return 0;
    }

    async getDexTokensLength(): Promise<number> {
        return this.tokensLength;
    }

    async getPairs2(): Promise<number> {
        return 0;
    }

    async getTokensDecimals(addresses: string[]):Promise< { [address: string]: string }>
    {
        const provider = getDefaultProvider();
        const { multicallv2 } = createMulticall(provider)
        const tokenSymbols: Call[] = addresses.map((address) => ({
            address: address[0] as string,
            name: 'decimals',
            params: [],
        }));
        const tokenDecimalsResult = await multicallv2<string[]>({
            abi: IUniswapV2PairABI,
            calls: tokenSymbols
        })
        // console.log(`${tokenDecimalsResult}`)
        let retVal:{[address: string]: string} = {};
        let index = 0;
        for(const elem of addresses)
        {
            retVal[elem] = tokenDecimalsResult[index];
            index++;
        }
        return retVal;
    }

    async getTokensSymbols(addresses: string[]):Promise< { [address: string]: string }>
    {
        const provider = getDefaultProvider();
        const { multicallv2 } = createMulticall(provider)
        const tokenSymbols: Call[] = addresses.map((address) => ({
            address: address[0] as string,
            name: 'symbol',
            params: [],
        }));
        const tokenSymbolsResult = await multicallv2<string[]>({
            abi: IERC20ABI.abi,
            calls: tokenSymbols
        })
        // console.log(`${tokenSymbolsResult}`)
        let retVal:{[address: string]: string} = {};
        let index = 0;
        for(const elem of addresses)
        {
            retVal[elem] = tokenSymbolsResult[index];
            index++;
        }

        return retVal;
    }

    async getTokensFromPairs(addresses:string[]):Promise<{tokens0:string[],tokens1:string[]}>
    {
        const provider = getDefaultProvider();
        const { multicallv2 } = createMulticall(provider)
        const token0Calls: Call[] = addresses.map((address) => ({
            address: address[0] as string,
            name: 'token0',
            params: [],
        }));
        const token1Calls: Call[] = addresses.map((address) => ({
            address: address[0] as string,
            name: 'token1',
            params: [],
        }));

        let promises = [];

        promises.push(new Promise(async (resolve, reject) => {
            const token0Results = await multicallv2<string[]>({
                abi: IUniswapV2PairABI,
                calls: token0Calls
            })
            resolve(token0Results);
        }))
        
        promises.push(new Promise(async (resolve, reject) => {
            const token1Results = await multicallv2<string[]>({
                abi: IUniswapV2PairABI,
                calls: token1Calls
            })
            resolve(token1Results);
        }))
        let tokens0res: any[] = []
        let tokens1res: any[] = []
        await Promise.all(promises).then((values) => {
          tokens0res = values[0] as [string]
          tokens1res = values[1] as [string]
        })

        return {tokens0: tokens0res,tokens1: tokens1res};

        // const token0Results = await multicallv2<string[]>({
        //     abi: IUniswapV2PairABI,
        //     calls: token0Calls
        // })

        // const token1Results = await multicallv2<string[]>({
        //     abi: IUniswapV2PairABI,
        //     calls: token1Calls
        // })
        // return { tokens0: token0Results, tokens1: token1Results}
    }

    async getPairsFromRouter(address:string):Promise<string[]>
    {
        const provider = getDefaultProvider();
        let factoryContract = this.basedFinance.contracts["DEXFactory"];
        let pairsLength = Number(await factoryContract.allPairsLength());
        let pairsNum = [...Array(pairsLength).keys()];
        const { multicallv2 } = createMulticall(provider)
        const reserveCalls: Call[] = pairsNum.map((index) => ({
             address: address as string,
             name: 'allPairs',
             params: [index],
         }));

        const results = await multicallv2<string[]>({
            abi: this.basedFinance.config.deployments["DEXFactory"].abi,
            calls: reserveCalls
        })
        return results;
    }

    async getPairs(): Promise<number> {

      const provider = getDefaultProvider();
      let factoryContract = this.basedFinance.contracts["DEXFactory"];
        let dateCalcStart = Date.now();

        let pairAddresses = await this.getPairsFromRouter(factoryContract.address);   
        let tokens = await this.getTokensFromPairs(pairAddresses);

        let tokenSymbols = await this.getTokensSymbols([...tokens.tokens0,...tokens.tokens1]);
        let tokenDecimals = await this.getTokensDecimals([...tokens.tokens0,...tokens.tokens1]);


        for(var index = 0;index<pairAddresses.length;index++)
        {
            const token0ERC20 =  new ERC20(tokens.tokens0[index][0], provider,
                tokenSymbols[tokens.tokens0[index][0]][0], Number(tokenDecimals[tokens.tokens0[index][0]][0]));
            if( !token0ERC20 ){
                console.log("Error token0ERC20")
                continue;
            }
            const token1ERC20 =  new ERC20(tokens.tokens1[index][0], provider,
                tokenSymbols[tokens.tokens1[index][0]][0], Number(tokenDecimals[tokens.tokens1[index][0]][0]));
            if( !token1ERC20 ){
                console.log("Error token1ERC20")
                continue;
            }
            let tokenA = new Token(ChainId.MAINNET,tokens.tokens0[index][0],Number(tokenDecimals[tokens.tokens0[index][0]][0]));
            let tokenB = new Token(ChainId.MAINNET,tokens.tokens1[index][0],Number(tokenDecimals[tokens.tokens1[index][0]][0]));

            const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, "0"),
                CurrencyAmount.fromRawAmount(tokenB, "0"));

            let symbolToken0 = tokenSymbols[tokens.tokens0[index][0]][0];
            let symbolToken1 = tokenSymbols[tokens.tokens1[index][0]][0];
            
            if( token0ERC20.address === '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'){
                symbolToken0 = 'FTM';
            }
            if( token1ERC20.address === '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'){
                symbolToken1 = 'FTM';
            }

            let token0name = symbolToken0;
            let token1name = symbolToken1;

            if( token0name === "USDC" )
                token0name = "USDC(MULTI)"

            if( token0name === "USDC" )
                token1name = "USDC(MULTI)"

            let token0Info : DexTokenInfo = {name: token0name, address: token0ERC20.address,isTaxed: true,
                symbol: token0ERC20.symbol, contract: token0ERC20 }
            let token1Info : DexTokenInfo = {name: token1name, address: token1ERC20.address,isTaxed: true,
                symbol: token1ERC20.symbol, contract: token1ERC20 }

            
            if(pair.liquidityToken.address === "0xd4DDdF08F12e8eA1d7dd5a47418cDF3d93A5be96" || pair.liquidityToken.address === "0xf799AEa5df9fc8faC93D5e2A5277b4E82817ccB5"){
                continue;
            }

            if( pair.liquidityToken.address === "0x7a6C9B27e20560253d4080944A252494C702f1a2" || pair.liquidityToken.address === "0xd4DDdF08F12e8eA1d7dd5a47418cDF3d93A5be96")
                continue;

            this.dexTokens[token0Info.address] = token0Info;
            this.dexTokens[token1Info.address] = token1Info;

            let pairInfo: DexPairInfo = {contract: pair, address: pair.liquidityToken.address, token0Address: token0Info.address,
                token1Address: token1Info.address, token0: token0Info, token1: token1Info}

            this.dexPairsInfo[pair.liquidityToken.address] = pairInfo;
        }

        // const newTokenERC =  new ERC20("0x6CEbb8cD66Fca7E6aca65841Ae3A04B7884F4de8", provider,
        // "FUCKMULTI", 18);

        // let newToken : DexTokenInfo = {name: "fuckmulti", address: "0x6CEbb8cD66Fca7E6aca65841Ae3A04B7884F4de8",isTaxed: false,
        //     symbol: newTokenERC.symbol, contract: newTokenERC }
        //     this.dexTokens[newToken.address] = newToken;


        for (var key in this.dexTokens) {
            if (this.dexTokens.hasOwnProperty(key)) {
                this.dexTokensInfo.push(this.dexTokens[key]);
                this.tokensLength++;
                this.dexTokens[key].contract.connect(this.basedFinance.signer);
            }
        }
        let dateCalcStop = Date.now();
        console.log(`Refresh pairs info ${dateCalcStop.valueOf() - dateCalcStart.valueOf()} ms`);
        this.lastPairUpdates = 40000; // WE HAVE TO UPDATE PAIRS INFO AFTER LOGIN 
        return this.tokensLength;

    }


    async computePairAddress(factoryAddress:string,
      tokenAAddress:string,
      tokenBAddress:string): Promise<string>
    {
        const [token0, token1] = tokenAAddress.toLowerCase() < tokenBAddress.toLowerCase()
        ? [tokenAAddress, tokenBAddress] : [tokenBAddress, tokenAAddress]
        return getCreate2Address(
        factoryAddress,
        keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
        "0x9bbbc3a1671835a95223cff5fac60a303310de646cf33d8a420bcb4474601f33"
        )
    }

    async dexSwap(swapInfo: DexSwapInfo, token0Amount: string): Promise<TransactionResponse> {

        let path:string[] = [];

        for(var elem of swapInfo.route)
        {
            path.push(elem.address);
        }

        let amount = swapInfo.isMainTokenChanged ? ethers.utils.parseUnits(token0Amount,
            swapInfo.token0.contract.decimal) : ethers.utils.parseUnits(token0Amount,
            swapInfo.token1.contract.decimal);

        let limAmount = swapInfo.isMainTokenChanged ? ethers.utils.parseUnits(swapInfo.minRecieved,
            swapInfo.token1.contract.decimal) : ethers.utils.parseUnits(swapInfo.minRecieved,
            swapInfo.token0.contract.decimal) ;
    
        let routerContract = this.basedFinance.contracts["DEXRouter"];
        if( !routerContract ){
            //TODO!! Throw Error!!!
            return ;
        }
        if(swapInfo.isMainTokenChanged)
        {
            if(path[0] == this.basedFinance.externalTokens['WFTM'].address)
            {
                const options = {value: amount}
                return await routerContract.swapExactETHForTokens(limAmount,
                    path,this.basedFinance.myAccount,Date.now() + 60,options);
            }
            if(path[path.length-1] == this.basedFinance.externalTokens['WFTM'].address)
            {
                return await routerContract.swapExactTokensForETH(amount,limAmount,
                path,this.basedFinance.myAccount,Date.now() + 60);
            }
           return await routerContract.swapExactTokensForTokens(amount,
               limAmount,path,this.basedFinance.myAccount,Date.now() + 60);
        }
        else
        {
            if(path[0] == this.basedFinance.externalTokens['WFTM'].address)
            {
                let amountFtm = ethers.utils.parseUnits(swapInfo.minRecieved.toString(),
                    swapInfo.token0.contract.decimal);
                const options = {value: amountFtm}

                return await routerContract.swapETHForExactTokens(amount,
                    path,this.basedFinance.myAccount,Date.now() + 60,options);
            }
            if(path[path.length-1] == this.basedFinance.externalTokens['WFTM'].address)
            {
                return await routerContract.swapTokensForExactETH(amount,limAmount,
                    path,this.basedFinance.myAccount,Date.now() + 60);
            }

            return await routerContract.swapTokensForExactTokens(amount,
                limAmount,path,this.basedFinance.myAccount,Date.now() + 60);
        }

    }

    async refreshPairInfo(key: any) : Promise<number> {
        const provider = getDefaultProvider();
        console.log("REDRESH PAI")
        let pairLoc = this.dexPairsInfo[key];
        let lp = new Contract(pairLoc.address, IUniswapV2PairABI, provider);
        if( lp ){
          let [reserveA,reserveB] = await lp.getReserves();

          let tokenA = new Token(ChainId.MAINNET,pairLoc.token0Address, pairLoc.token0.contract.decimal);
          let tokenB = new Token(ChainId.MAINNET,pairLoc.token1Address,pairLoc.token1.contract.decimal);

            const [reserveAA, reserveBB] = tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
                ? [reserveA, reserveB] : [reserveB, reserveA];

          const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, reserveAA.toString()),
            CurrencyAmount.fromRawAmount(tokenB, reserveBB.toString()));

          pairLoc.contract = pair;
          console.log(" end REDRESH PAI")
            return 1
        }
        console.log("Not end refresh")
        return 0
    }

    async refreshPaisrsInfo() {

      if((Date.now().valueOf() - this.lastPairUpdates) <= 30000)
      {
          return;
      }
      const provider = getDefaultProvider();
      let promises = [];
      for (var key in this.dexPairsInfo)
      {
         promises.push(new Promise(async (resolve, reject) => {
            let pairLoc = this.dexPairsInfo[key];
            let lp = new Contract(pairLoc.address, IUniswapV2PairABI, provider);
            if( lp ){
              let [reserveA,reserveB] = await lp.getReserves();
    
              let tokenA = new Token(ChainId.MAINNET,pairLoc.token0Address, pairLoc.token0.contract.decimal);
              let tokenB = new Token(ChainId.MAINNET,pairLoc.token1Address,pairLoc.token1.contract.decimal);
    
                const [reserveAA, reserveBB] = tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
                    ? [reserveA, reserveB] : [reserveB, reserveA];
    
              const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, reserveAA.toString()),
                CurrencyAmount.fromRawAmount(tokenB, reserveBB.toString()));
    
              pairLoc.contract = pair;
            }
            resolve(1);
            }))
      }
      await Promise.all(promises).then(function(res) {
      })
      this.lastPairUpdates = Date.now().valueOf();
    }

    async dexGetPairAddress(tokenAAddress:string,tokenBAddress:string):Promise<string>
    {
        let factoryContract = this.basedFinance.contracts["DEXFactory"];
        let address = await this.computePairAddress(factoryContract.address,tokenAAddress,tokenBAddress);
        return address;
    }

    async trim_decimal_overflow(n: any, decimals: any){
        n+=""
    
        if(n.indexOf(".") === -1) return n
        
        const arr = n.split(".");
        const fraction = arr[1] .substr(0, decimals);
        return arr[0] + "." + fraction;
    }

    async addLiquidity(token0: DexTokenInfo, token1: DexTokenInfo,
        token0Amount: string, token1Amount: string,
        lpAmount: number, slippage: number):Promise<TransactionResponse>{

        let routerContract = this.basedFinance.contracts["DEXRouter"];
        if( !routerContract ){
            //TODO!! Throw Error!!!
            return ;
        }


        token0Amount = token0Amount.substring(0,18)
        token1Amount = token1Amount.substring(0,18)


        let amountABig = ethers.utils.parseUnits( token0Amount,token0.contract.decimal);
        let amountBBig = ethers.utils.parseUnits(token1Amount,token1.contract.decimal);


        if((await token0.contract.balanceOf(this.basedFinance.myAccount)).lt(amountABig))
        {
            //TODO! Error
            console.log(`Innusuficent funds ${token0.contract.address} ${await token0.contract.balanceOf(this.basedFinance.myAccount)}`);
        }
        if((await token1.contract.balanceOf(this.basedFinance.myAccount)).lt(amountBBig))
        {
            //TODO! Error
            console.log(`Innusuficent funds ${token1.contract.address} ${await token1.contract.balanceOf(this.basedFinance.myAccount)}`);
        }

        let minAmountA = (amountABig).sub((amountABig).div(100).mul(slippage));
        let minAmountB = (amountBBig).sub((amountBBig).div(100).mul(slippage));

       

        let nativeAddLiquidity = false;
        let tokenNotNative = "";
        let tokenNativeAmount=ethers.utils.parseEther("0");
        let tokenNotNativeAmount=ethers.utils.parseEther("0");
        let tokenNativeMinAmount=ethers.utils.parseEther("0");
        let tokenNotNativeMinAmount=ethers.utils.parseEther("0");

        if(token0.address == this.basedFinance.externalTokens['WFTM'].address)
        {
            nativeAddLiquidity = true;
            tokenNotNative = token1.address;
            tokenNotNativeAmount = amountBBig;
            tokenNativeAmount = amountABig;
            tokenNotNativeMinAmount = minAmountB;
            tokenNativeMinAmount = minAmountA;

        }
        else if(token1.address == this.basedFinance.externalTokens['WFTM'].address)
        {
            nativeAddLiquidity = true;
            tokenNotNative = token0.address;
            tokenNotNativeAmount = amountABig;
            tokenNativeAmount = amountBBig;
            tokenNotNativeMinAmount = minAmountA;
            tokenNativeMinAmount = minAmountB;
        }

        if(nativeAddLiquidity)
        {
            const options = {value: tokenNativeAmount}
            return await routerContract.addLiquidityETH(tokenNotNative,tokenNotNativeAmount,
                tokenNotNativeMinAmount,tokenNativeMinAmount,this.basedFinance.myAccount,Date.now() + 60,options);
        }


        return await routerContract.addLiquidity(token0.address,token1.address,
            amountABig,amountBBig,minAmountA,minAmountB,
            this.basedFinance.myAccount,Date.now() + 60);
    }
    async getMyLiquidityInfo() : Promise<DexMyLiquidityInfo> {
        let liquidityInfo:DexMyLiquidityInfo = {liquidityInfo:[]};

        await this.refreshPaisrsInfo();

        for (var key in this.dexPairsInfo) {
            let dexLiquidityInfo : DexLiquidityInfo = {token0Amount: "0", token0Price: "0",
                token1Amount: "0", token1Price: "0", lpAmount: 0, shareOfPool: 0, isMainTokenChanged: true, isPairNew: false};
            let pair = this.dexPairsInfo[key];
            let pairContract = new Contract(pair.address, IUniswapV2PairABI,
                this.basedFinance.provider);
            let balance = await pairContract.balanceOf(this.basedFinance.myAccount);
            let totalSupply = await pairContract.totalSupply();
            dexLiquidityInfo.lpAmount = Number(ethers.utils.formatUnits(balance,
                pair.contract.liquidityToken.decimals));
            dexLiquidityInfo.shareOfPool = Number(balance.mul(100).div(await pairContract.totalSupply()));
            dexLiquidityInfo.token0 = pair.token0;
            dexLiquidityInfo.token1 = pair.token1;
            dexLiquidityInfo.lpContract = new ERC20(pairContract.address, this.basedFinance.provider, "", 18);
            dexLiquidityInfo.lpContract.connect(this.basedFinance.signer);

            if(dexLiquidityInfo.lpAmount > 0) {
                let tokenA = new Token(ChainId.MAINNET, pair.token0.address, pair.token0.contract.decimal);
                let tokenB = new Token(ChainId.MAINNET, pair.token1.address, pair.token1.contract.decimal);
                let outAamount = pair.contract.getLiquidityValue(tokenA,CurrencyAmount.fromRawAmount(pair.contract.liquidityToken, totalSupply),
                    CurrencyAmount.fromRawAmount(pair.contract.liquidityToken, balance),false);
                let outBamount = pair.contract.getLiquidityValue(tokenB,CurrencyAmount.fromRawAmount(pair.contract.liquidityToken, totalSupply),
                    CurrencyAmount.fromRawAmount(pair.contract.liquidityToken, balance),false);
                dexLiquidityInfo.token0Amount = (outAamount.toFixed());
                dexLiquidityInfo.token1Amount = (outBamount.toFixed());

                liquidityInfo.liquidityInfo.push(dexLiquidityInfo);
            }

            // pair.contract.liquidityToken.
        }
        return liquidityInfo;
    }

    async removeLiquidity(minRecieved: number, info: DexLiquidityInfo): Promise<TransactionResponse>{

        let routerContract = this.basedFinance.contracts["DEXRouter"];
        if( !routerContract ){
            //TODO!! Throw Error!!!
            return ;
        }
        let pair = this.dexPairsInfo[info.lpContract.address];

        if(info.token0.address == this.basedFinance.externalTokens['WFTM'].address)
        {
            return await routerContract.removeLiquidityETH(info.token1.address,
                ethers.utils.parseUnits(info.lpAmount.toString(),pair.contract.liquidityToken.decimals),
                0,0,this.basedFinance.myAccount,Date.now() + 60);
        }
        else if(info.token1.address == this.basedFinance.externalTokens['WFTM'].address)
        {
            return await routerContract.removeLiquidityETH(info.token0.address,
                ethers.utils.parseUnits(info.lpAmount.toString(),pair.contract.liquidityToken.decimals),
                0,0,this.basedFinance.myAccount,Date.now() + 60);
        }

       return await routerContract.removeLiquidity(info.token0.address,info.token1.address,
        ethers.utils.parseUnits(info.lpAmount.toString(),pair.contract.liquidityToken.decimals),
        0,0,this.basedFinance.myAccount,Date.now() + 60);

    }

    async getLiquidity(token0Info: DexTokenInfo, token1Info: DexTokenInfo, tokenAmount: string,
       slippage: number, isMainTokenChanged: boolean): Promise<DexLiquidityInfo>
    {
      // token0Price: number;
      // token1Price: number;
      // token0Amount: number;
      // token1Amount: number;
      // lpAmount: number;
      // shareOfPool: number;
        let dexLiquidityInfo : DexLiquidityInfo = {token0Amount: "0", token0Price: "0",
            token1Amount: "0", token1Price: "0", lpAmount: 0, shareOfPool: 0, isMainTokenChanged: true, isPairNew: false};

        // await this.refreshPaisrsInfo();

        dexLiquidityInfo.token0 = token0Info;
        dexLiquidityInfo.token1 = token1Info;

        let pairAddress = await this.dexGetPairAddress(token0Info.address,
            token1Info.address);

        let pairContract = new Contract(await pairAddress, IUniswapV2PairABI,
            this.basedFinance.provider);

        // let pairContract = await ethers.getContractAt('UniswapV2Pair',pairAddress);

        try{
          let pair = this.dexPairsInfo[pairAddress];
          if(!pair)
          {
            dexLiquidityInfo.lpAmount = Number(0);
            if( isMainTokenChanged ){
              dexLiquidityInfo.token0Amount = tokenAmount;
              dexLiquidityInfo.token1Amount = "0";
            }
            else {
              dexLiquidityInfo.token0Amount = "0";
              dexLiquidityInfo.token1Amount = tokenAmount;
            }
  
            dexLiquidityInfo.token0Price = "0";
            dexLiquidityInfo.token1Price = "0";
            dexLiquidityInfo.shareOfPool = 100;
            dexLiquidityInfo.isPairNew = true;
            return dexLiquidityInfo;
          }
        }catch(error){
          console.error(error)
        }
        
        let token0 = token0Info.contract;
        let token0decimal = token0Info.contract.decimal;

        let token1 = token1Info.contract;
        let token1decimal = token1Info.contract.decimal;

        let [reserveA,reserveB] = await pairContract.getReserves();

        const [reserveAA, reserveBB] = token0.address.toLowerCase() < token1.address.toLowerCase()
            ? [reserveA, reserveB] : [reserveB, reserveA];

        let tokenA = new Token(ChainId.MAINNET,token0.address,token0decimal);
        let tokenB = new Token(ChainId.MAINNET,token1.address,token1decimal);



         const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, reserveAA.toString()),
             CurrencyAmount.fromRawAmount(tokenB, reserveBB.toString()));

         let totalSupply =  await pairContract.totalSupply();
         dexLiquidityInfo.lpContract = new ERC20(pairContract.address, this.basedFinance.provider, "", 18);
         dexLiquidityInfo.lpContract.connect(this.basedFinance.signer);

         token0decimal = 18;
         token1decimal = 18;


        let tokenAmountBig: BigNumber = BigNumber.from("0")
        if( isMainTokenChanged ){
            tokenAmountBig = ethers.utils.parseUnits(tokenAmount, token0decimal) 
        } else {
            tokenAmountBig =  ethers.utils.parseUnits(tokenAmount, token1decimal) 
        }
    

        let token0ByPrice  = token0.address.toLowerCase() < token1.address.toLowerCase() ? tokenAmountBig.mul(ethers.utils.parseUnits(pair.token1Price.toFixed(token1decimal), token1decimal)) :
        tokenAmountBig.mul(ethers.utils.parseUnits(pair.token0Price.toFixed(token0decimal), token0decimal));

   

        let token1ByPrice = token0.address.toLowerCase() > token1.address.toLowerCase() ? tokenAmountBig.mul(ethers.utils.parseUnits(pair.token1Price.toFixed(token1decimal), token1decimal)) :
        tokenAmountBig.mul(ethers.utils.parseUnits(pair.token0Price.toFixed(token0decimal), token0decimal));
        let token0Price  = token0.address.toLowerCase() < token1.address.toLowerCase() ?  (pair.token1Price.toFixed()) :
         (pair.token0Price.toFixed());


        let token1Price = token0.address.toLowerCase() > token1.address.toLowerCase() ?  (pair.token1Price.toFixed()) :
             (pair.token0Price.toFixed());


        const totalSupNum = getBalance(totalSupply, 18);
        try{
          if( isMainTokenChanged ){
            

            let lpCount = pair.getLiquidityMinted(
              CurrencyAmount.fromRawAmount(pair.liquidityToken,totalSupply.toString()),
              CurrencyAmount.fromRawAmount(tokenA, tokenAmountBig.toString()),
              CurrencyAmount.fromRawAmount(tokenB, token1ByPrice.toString()))
              //761321774137205979000000
              //28730128035754446692000000000000000000
              let percent =   Number(lpCount.toFixed(lpCount.currency.decimals)) * 100 /  Number(ethers.utils.formatUnits(totalSupply,lpCount.currency.decimals));
              // Number(ethers.utils.formatUnits(finalTax,token0Sdk.decimals)) * 100 / Number(ethers.utils.formatUnits(amountBig,token0Sdk.decimals));
              dexLiquidityInfo.lpAmount = Number(lpCount.toFixed());
              dexLiquidityInfo.token0Amount = tokenAmount;
            //   console.log(token1.decimal)
            //   console.log(token1ByPrice.toString())
              dexLiquidityInfo.token1Amount = ethers.utils.formatUnits(token1ByPrice, token1decimal *2);
               console.log("Main 0 ", dexLiquidityInfo.token0Amount)
               console.log("Main 1 ", dexLiquidityInfo.token1Amount)
              dexLiquidityInfo.token0Price = "1";
              dexLiquidityInfo.token1Price = token1Price;
              dexLiquidityInfo.shareOfPool = Number(percent);//Number(lpCount.toFixed()) * 100.0 / totalSupNum;
              dexLiquidityInfo.isMainTokenChanged = true;
          }
          else{
            let lpCount = pair.getLiquidityMinted(
              CurrencyAmount.fromRawAmount(pair.liquidityToken,totalSupply.toString()),
              CurrencyAmount.fromRawAmount(tokenA, token0ByPrice.toString()),
              CurrencyAmount.fromRawAmount(tokenB, tokenAmountBig.toString()))
              let percent =   ethers.utils.parseUnits(lpCount.toFixed(),lpCount
                  .currency.decimals).mul(100).div(totalSupply);

            dexLiquidityInfo.lpAmount = Number(lpCount.toFixed());
            dexLiquidityInfo.token0Amount = ethers.utils.formatUnits(token0ByPrice,token1decimal*2);
            dexLiquidityInfo.token1Amount = tokenAmount;
            console.log("Minor 0 ", dexLiquidityInfo.token0Amount)
            console.log("Minor 1", dexLiquidityInfo.token1Amount)
            dexLiquidityInfo.token0Price =  token0Price;
            dexLiquidityInfo.token1Price = "1";
            dexLiquidityInfo.shareOfPool = Number(percent);//Number(lpCount.toFixed()) * 100.0 / totalSupNum;
            dexLiquidityInfo.isMainTokenChanged = false;

          }


          // console.log(`Out amount ${outAm.toFixed()} `);
        }catch(error){
          console.error(error)
          dexLiquidityInfo.lpAmount = Number(0);
          if( isMainTokenChanged ){
            dexLiquidityInfo.token0Amount = tokenAmount;
            dexLiquidityInfo.token1Amount = "0";
          }
          else {
            dexLiquidityInfo.token0Amount = "0";
            dexLiquidityInfo.token1Amount = tokenAmount;
          }

          dexLiquidityInfo.token0Price = "0";
          dexLiquidityInfo.token1Price = "0";
          dexLiquidityInfo.shareOfPool = 0;
        }
        // //let price = new Price();

        if( this.farms.length > 0 ){
          for( let i = 0; i < this.farms.length; i++ ){
            if(this.farms[i].pair === pairAddress ){
              dexLiquidityInfo.farms = this.farms[i];
            }
          }
        }

        return dexLiquidityInfo;
    }

    async getUserDiscount(disco:DexDiscountTable):Promise<DexUserDiscount>
    {
        let userDiscount: DexUserDiscount = {tokenAddress:"",userBalance:0,
            userDiscount:0,discountAmount:0};

        let tokenAddress = disco.tokenAddress;
        let token0Contract = new ethers.Contract(tokenAddress, IERC20ABI.abi, this.basedFinance.provider);
        if(Date.now().valueOf() - disco.lastUpdateTime >= 60000) {
            disco.userBalance = await token0Contract.balanceOf(this.basedFinance.myAccount);
            disco.decimals = await token0Contract.decimals();
            disco.lastUpdateTime = Date.now().valueOf();
        }
        if(disco.userBalance.gte(0))
        {
            for(let i =0 ; i < disco.amounts.length;i++)
            {
                if(disco.userBalance.gte(disco.amounts[i]))
                {
                    userDiscount.userDiscount = Number(disco.discounts[i]);
                    userDiscount.discountAmount = Number(ethers.utils.formatUnits(disco.amounts[i], disco.decimals));
                    userDiscount.tokenAddress = tokenAddress;
                    if(this.dexTokens[userDiscount.tokenAddress] == undefined)
                    {
                        const provider = getDefaultProvider();
                        let tokenContract = new ethers.Contract(tokenAddress, IERC20ABI.abi, this.basedFinance.provider);
                        const tokenERC20 =  new ERC20(tokenContract.address, provider, await tokenContract.symbol());

                        let dexTokenInfo:DexTokenInfo = {name:tokenERC20.symbol,address:tokenAddress,
                            symbol:tokenERC20.symbol,contract:tokenERC20};
                        this.dexTokens[tokenAddress] = dexTokenInfo;
                    }
                }
                else
                {
                    break;
                }
            }
            userDiscount.userBalance = Number(ethers.utils.formatUnits(disco.userBalance, disco.decimals));
        }

        return userDiscount;
    }

    async getDiscountTokensInfo(pairAddress:string):Promise<{discounttable:DexDiscountTable[],userDisocunt:DexUserDiscount[]}>
    {let routerContract = this.basedFinance.contracts["DEXRouter"];
        if( !routerContract ){
            //TODO!! Throw Error!!!
            return ;
        }
        let userDiscounts:DexUserDiscount[] = [];

        let emptyTable:DexDiscountTable = {
            discounts: [],
            amounts: [],
            tokenAddress:  "",
            empty:true,
            lastUpdateTime:0,
            userBalance: ethers.utils.parseUnits("0",18),
            decimals:0,} ;

        if(this.discoTables[pairAddress] != undefined)
        {
            for(var elem of this.discoTables[pairAddress])
            {
                if(elem.empty)
                    return {discounttable:this.discoTables[pairAddress],userDisocunt:userDiscounts}
                let userDiscount: DexUserDiscount = await this.getUserDiscount(elem);
                if(userDiscount.userDiscount > 0)
                    userDiscounts.push(userDiscount);
            }
            return {discounttable:this.discoTables[pairAddress],userDisocunt:userDiscounts}
        }

        let discountTable = await routerContract.getHoldingDiscountTokens(pairAddress);

        this.discoTables[pairAddress] = [];

        if(discountTable.length == 0)
        {
            this.discoTables[pairAddress].push(emptyTable);
            return {discounttable:this.discoTables[pairAddress],userDisocunt:userDiscounts}
        }

        for(var disco of discountTable)
        {
            if(!disco.isActive || disco.tokenAddress == "0xDa75e2Ec9f75B758D91468A6EeC5C201fF0EB63C" )
                continue;
            let discoTable:DexDiscountTable = {
                discounts: disco.discount,
                amounts: disco.tokenAmount,
                tokenAddress:  disco.tokenAddress,
                empty:false,
                lastUpdateTime:0,
                userBalance: ethers.utils.parseUnits("0",18),
                decimals:0} ;
            let userDiscount: DexUserDiscount = await this.getUserDiscount(discoTable);
            this.discoTables[pairAddress].push(discoTable);

            if(userDiscount.userDiscount > 0)
                userDiscounts.push(userDiscount);
        }

        return {discounttable:this.discoTables[pairAddress],userDisocunt:userDiscounts}
    }

    async getRemoveLiquidityInfo(amount: number, info:DexLiquidityInfo): Promise<DexLiquidityInfo>{
      let removeInfo: DexLiquidityInfo = {token0Amount: "0", token0Price: "0",
          token1Amount: "0", token1Price: "0", lpAmount: 0, shareOfPool: 0, isMainTokenChanged: true, isPairNew: false}; 
      // removeInfo.token0Amount = 1.2;
      // removeInfo.token1Amount = 1.3;
      // removeInfo.lpAmount =  2; //MIN RECIEVED
        let pair = this.dexPairsInfo[info.lpContract.address];
        let tokenA = new Token(ChainId.MAINNET,info.token0.address, info.token0.contract.decimal);
        let tokenB = new Token(ChainId.MAINNET,info.token1.address, info.token1.contract.decimal);
        let pairContract = new Contract(pair.address, IUniswapV2PairABI,
            this.basedFinance.provider);
        let totalSupply = await pairContract.totalSupply();
        let  balance = ethers.utils.parseUnits(amount.toString(),pair.contract.liquidityToken.decimals);
        let outAamount = pair.contract.getLiquidityValue(tokenA,CurrencyAmount.fromRawAmount(pair.contract.liquidityToken, totalSupply),
            CurrencyAmount.fromRawAmount(pair.contract.liquidityToken, balance.toString()),false);
        let outBamount = pair.contract.getLiquidityValue(tokenB,CurrencyAmount.fromRawAmount(pair.contract.liquidityToken, totalSupply),
            CurrencyAmount.fromRawAmount(pair.contract.liquidityToken, balance.toString()),false);
        removeInfo.token0Amount = (outAamount.toFixed());
        removeInfo.token1Amount = (outBamount.toFixed());
        removeInfo.token0 = info.token0;
        removeInfo.token1 = info.token1;
        removeInfo.lpAmount = amount;
        removeInfo.lpContract = info.lpContract;
      return removeInfo;
    }

    //DEX SWAP FUNCS
    async getSwapInfo(token0: DexTokenInfo, token1: DexTokenInfo,
       amount: string, slippage: number, isMainTokenChanged: boolean): Promise<DexSwapInfo> {
        let swapInfo: DexSwapInfo = {token0: token0, token1: token1, sellTax: 0, buyTax: 0, token0Price : "0",
           token1Price : "0", minRecieved : "0", priceImpact: 0, fee: 0, discount : 0, swapAmount: "0",
            discountTable:[],userDiscounts:[], amountInput: amount};

        if(amount == "0" || amount.length == 0)
            return ;
        let dateCalcStart = Date.now();

        await this.refreshPaisrsInfo();
        let dateCalcStop = Date.now();

       // console.log(`Refresh pairs info ${dateCalcStop.valueOf() - dateCalcStart.valueOf()} ms`);

        if(!token0.contract || !token1.contract)
          return swapInfo;
        const token0Sdk = new Token(ChainId.MAINNET, token0.address,
            token0.contract.decimal, token0.symbol);
        const token1Sdk = new Token(ChainId.MAINNET, token1.address,
            token1.contract.decimal, token1.symbol);

        let pairs:Pair[] = [];

        for (var key in this.dexPairsInfo)
        {
            let pair = this.dexPairsInfo[key];
           // if(pair.contract.involvesToken(token0Sdk) || pair.contract.involvesToken(token1Sdk) )
            {
                pairs.push(this.dexPairsInfo[key].contract);
            }
        }

        let amountBig = ethers.utils.parseUnits(amount.toString(),isMainTokenChanged ? token0Sdk.decimals: token1Sdk.decimals);
        if(isMainTokenChanged) {
            let tradeExactIn = Trade.bestTradeExactIn(pairs, CurrencyAmount.fromRawAmount(token0Sdk, amountBig.toString()),
                token1Sdk,{ maxNumResults : 5, maxHops: 5 });

            swapInfo.isMainTokenChanged = true;
            swapInfo.route = [];
            if(tradeExactIn.length == 0)
            {
                //TODO!! Throw Error!!!
                console.error("tradeExactIn.length = 0")
                return ;
            }

            let routerContract = this.basedFinance.contracts["DEXRouter"];
            if( !routerContract ){
                //TODO!! Throw Error!!!
                return ;
            }

            let path:string[] = [];
            for(var elem of tradeExactIn[0].route.path)
            {
                path.push(elem.address);
                swapInfo.route.push(this.dexTokens[elem.address]);

            }
            let finalTax = BigNumber.from(0);
            let discount:number = 0;

            try{
                let [dexTax,partnerTax] = await routerContract.calcTotalSwapTax(path,
                    this.basedFinance.myAccount,amountBig.toString());
                    finalTax = dexTax.add(partnerTax);

                                 //let dexTaxPercent = (finalTax.mul(100)).div(amountBig);
             let dexTaxPercent= Number(ethers.utils.formatUnits(finalTax,token0Sdk.decimals)) * 100 / Number(ethers.utils.formatUnits(amountBig,token0Sdk.decimals));

             for(var el of tradeExactIn[0].route.pairs)
             {
               let [dexDisc,parDisc] = await routerContract.calcTaxDiscount(el.liquidityToken.address,this.basedFinance.myAccount);
               discount+=Number(dexDisc) + Number(parDisc);
                 dateCalcStart = Date.now();
                let discoInfo =  await this.getDiscountTokensInfo(el.liquidityToken.address);
                 dateCalcStop = Date.now();
                 console.log(`Get disco info  ${dateCalcStop.valueOf() - dateCalcStart.valueOf()} ms`);
 
                if(discoInfo.discounttable.length)
                    swapInfo.discountTable.push(discoInfo.discounttable);
                if(discoInfo.userDisocunt.length)
                    swapInfo.userDiscounts.push(discoInfo.userDisocunt);
 
             }
             discount/=100;
 
             swapInfo.priceImpact = Number(tradeExactIn[0].priceImpact.toFixed(18)) - 0.1; //sub FEE
 
             swapInfo.sellTax = dexTaxPercent + discount;
             if(dexTaxPercent) {
                 swapInfo.isTaxed = true;
             }
             else{
                 swapInfo.isTaxed = false;
             }
            } 
            catch(err){

            }

            

            // 0.034771744659513701
            // 0.03407630976632342698
            swapInfo.discount = discount;
            //swapInfo.slippage = swapInfo.sellTax;
            swapInfo.fee = 0.1;
            swapInfo.token0Price = "1.0";
            swapInfo.slippage = slippage;
            swapInfo.token1Price = (tradeExactIn[0].executionPrice.toFixed(18));


            // let amountBig2 = ethers.utils.parseUnits(amount.toString(), token0Sdk.decimals*2);

            // let swapAmount2 = amountBig2.add(finalTax).div(ethers.utils.parseUnits(tradeExactOut[0].executionPrice.toFixed(token0Sdk.decimals), token0Sdk.decimals));
            // swapInfo.swapAmount = ethers.utils.formatUnits(swapAmount2, isMainTokenChanged ? token0Sdk.decimals: token1Sdk.decimals );
  
            // swapInfo.priceImpact = Number(tradeExactOut[0].priceImpact.toFixed()) - 0.1;
            // swapInfo.minRecieved = ethers.utils.formatUnits(swapAmount2.add(swapAmount2.div(100).mul(slippage)),token0Sdk.decimals);

            let amountBig2 = ethers.utils.parseUnits(amount.toString(),isMainTokenChanged ? token0Sdk.decimals: token1Sdk.decimals);
            let swapAmountBig = amountBig2.sub(finalTax).mul(ethers.utils.parseUnits(tradeExactIn[0].executionPrice.toFixed(token0Sdk.decimals), isMainTokenChanged ? token0Sdk.decimals: token1Sdk.decimals));
            // 34771744659513701000000000000000000


            let test = swapAmountBig.div(ethers.utils.parseUnits("1", isMainTokenChanged ? token0Sdk.decimals: token1Sdk.decimals))
            swapInfo.swapAmount = ethers.utils.formatUnits(swapAmountBig, isMainTokenChanged ? token0Sdk.decimals * 2: token1Sdk.decimals * 2);
            swapInfo.minRecieved = ethers.utils.formatUnits(test.sub(test.div(100).mul(slippage)),isMainTokenChanged ? token0Sdk.decimals: token1Sdk.decimals );
            return swapInfo;
        }
        else
        {
          let tradeExactOut = Trade.bestTradeExactOut(pairs, token0Sdk, CurrencyAmount.fromRawAmount(token1Sdk, amountBig.toString()),{ maxNumResults : 5, maxHops: 5 });


          swapInfo.isMainTokenChanged = false;
          swapInfo.route = [];
          if(tradeExactOut.length == 0)
          {
              //TODO!! Throw Error!!!
              swapInfo.priceImpact = 100;
              console.error("no trade exact")
              return swapInfo;
          }

          let routerContract = this.basedFinance.contracts["DEXRouter"];
          if( !routerContract ){
              //TODO!! Throw Error!!!
              return swapInfo;
          }

          let path:string[] = [];
          for(var i = 0;i < tradeExactOut[0].route.path.length; i++)
         // for(var elem of tradeExactOut[0].route.path)
          {
              path.push(tradeExactOut[0].route.path[i].address);
              swapInfo.route.push(this.dexTokens[tradeExactOut[0].route.path[i].address]);
          }
          let discount:number = 0;
          let finalTax = BigNumber.from(0);

          try{
            let [dexTax,partnerTax] = await routerContract.calcTotalSwapTax(path,
                this.basedFinance.myAccount,amountBig.toString());
              dexTax = dexTax == undefined ? 0 : dexTax;
              let finalTax = dexTax.add(partnerTax);
              //let dexTaxPercent = (finalTax.mul(100)).div(amountBig);
              let dexTaxPercent= Number(ethers.utils.formatUnits(finalTax,token0Sdk.decimals)) * 100 / Number(ethers.utils.formatUnits(amountBig,token0Sdk.decimals));
    
              for(var el of tradeExactOut[0].route.pairs)
              {
                let [dexDisc,parDisc] = await routerContract.calcTaxDiscount(el.liquidityToken.address,this.basedFinance.myAccount);
                discount+=Number(dexDisc) + Number(parDisc);
                  let discoInfo =  await this.getDiscountTokensInfo(el.liquidityToken.address);
                  if(discoInfo.discounttable.length)
                      swapInfo.discountTable.push(discoInfo.discounttable);
                  if(discoInfo.userDisocunt.length)
                      swapInfo.userDiscounts.push(discoInfo.userDisocunt);
              }
              discount/=100;
    
    
              swapInfo.sellTax = dexTaxPercent + discount;
              if(dexTaxPercent) {
                  swapInfo.isTaxed = true;
              }
              else{
                  swapInfo.isTaxed = false;
              }
          }
          catch(err){
            
          }

          swapInfo.discount = discount;
          swapInfo.slippage = slippage;
          swapInfo.fee = 0.1;
          swapInfo.token0Price = (tradeExactOut[0].executionPrice.toFixed(18)); ;

          swapInfo.token1Price = "1.0";
          let amountBig2 = ethers.utils.parseUnits(amount.toString(), isMainTokenChanged ? token0Sdk.decimals * 2: token1Sdk.decimals * 2);
          let swapAmount2 = amountBig2.add(finalTax).div(ethers.utils.parseUnits(tradeExactOut[0].executionPrice.toFixed(isMainTokenChanged ? token0Sdk.decimals: token1Sdk.decimals), isMainTokenChanged ? token0Sdk.decimals: token1Sdk.decimals));

          swapInfo.swapAmount = ethers.utils.formatUnits(swapAmount2, isMainTokenChanged ? token0Sdk.decimals: token1Sdk.decimals );

          swapInfo.priceImpact = Number(tradeExactOut[0].priceImpact.toFixed()) - 0.1;
          swapInfo.minRecieved = ethers.utils.formatUnits(swapAmount2.add(swapAmount2.div(100).mul(slippage)),isMainTokenChanged ? token0Sdk.decimals: token1Sdk.decimals);

          return swapInfo;
        }

        return swapInfo;
    }
}