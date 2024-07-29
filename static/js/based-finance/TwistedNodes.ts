import { BasedFinance } from './BasedFinance';
import { BigNumber, Contract, ethers } from 'ethers';
import { TransactionResponse } from '@ethersproject/providers';
import { getDisplayBalance, getFullDisplayBalance } from '../utils/formatBalance';
import { SPOOKY_ROUTER_ADDR, TOMBSWAP_ROUTER_ADDR, TICKER, SMELT_TICKER, USDC_TICKER, FTM_TICKER } from '../utils/constants';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { ActiveNodeInfo, NodeRewardToken, TwistedNodesInfo } from './types';
import { createMulticall, Call } from './multicall'
import { getDefaultProvider } from '../utils/provider';


export class TwistedNodes {
    basedFinance: BasedFinance;
    possibleNodeRewardTokens: string[]
    rewardTokens: NodeRewardToken[]

    constructor(basedFinance: BasedFinance) {
      this.basedFinance = basedFinance;
      this.possibleNodeRewardTokens = [SMELT_TICKER, USDC_TICKER, FTM_TICKER];
      this.rewardTokens = [];
    }

    getTickerByTokenAddress(address: string): string {
      for( let i = 0; i < this.possibleNodeRewardTokens.length; i++ ){
        if( address === this.basedFinance.getTokenFromTicker(this.possibleNodeRewardTokens[i]).address ){
          return this.possibleNodeRewardTokens[i];
        }
      }
      return ""; //TODO THROW ERROR
    }
  

    async getTwistedNodesRewardTokens(depositToken: string): Promise<NodeRewardToken[]> {
      let nodeRewardTokens: NodeRewardToken[] = []

      const contract = this.basedFinance.contracts["TWISTEDNODES"];
      const rewardTokensBalance = Number(await contract.getRewardTokens());
      const rewardTokensGlob: NodeRewardToken[] = []


      for( let i = 0; i < rewardTokensBalance; i++ ){
        const reward = await contract.rewardTokens(i);
        if( reward ){
          let ticker = this.getTickerByTokenAddress(reward.token);
          rewardTokensGlob.push({tokenName: ticker, isActive: reward.isActive });
          if( reward.isActive ){
            nodeRewardTokens.push({tokenName: ticker, isActive: true});
          }
        }
      }
      this.rewardTokens = rewardTokensGlob;

      return nodeRewardTokens;
    }

    async getTotalValueLocked(depositToken: string, twistedNodesInfo: TwistedNodesInfo[]): Promise<number>{
      let tvl = 0;
      //TODO check for depositToken FUTURE
      for( let i = 0; i < twistedNodesInfo.length; i++ ){
        const node = twistedNodesInfo[i];
        const contract = this.basedFinance.contracts[node.nodeName];
        if( contract ){
          tvl += Number(getDisplayBalance(await contract.totalRewardDebtInDollars(), 6))
        }
      }
      return tvl; //* Number(smeltStats.priceInDollars)
    }

    async claimFromTwistedNode(depositToken: string, nodeInfo: ActiveNodeInfo): Promise<TransactionResponse> {
      let tx;
      const contract = this.basedFinance.contracts[nodeInfo.nodeName];
      if( nodeInfo.claimableRoi > 0 ){
        return contract.claimRoi(nodeInfo.index);
      }
      if( nodeInfo.claimableReward > 0 ){
        return contract.claimReward(nodeInfo.index, 0);
      }
      return tx;
    }

    // async getActiveTwistedNodesInfo(depositToken: string, twistedNodesInfo: TwistedNodesInfo[]) : Promise<[]>{
    //   let countNodes = [];

    //   return countNodes;
    // }

    async getTwistedNodesInfo(depositToken: string, twistedNodesInfo: TwistedNodesInfo[]): Promise<TwistedNodesInfo[]> {
      let twistedNodesUpdated: TwistedNodesInfo[] = twistedNodesInfo;
      for( let i = 0; i < twistedNodesUpdated.length; i++ ){
        const node = twistedNodesUpdated[i];
        const contract = this.basedFinance.contracts[node.nodeName];
        const lifespan = Number(await contract.lifeSpan()) /60/60/24;
        const roiTime = Number(await contract.roiTime()) /60/60/24;
        const amountRequired = Number(Number(getDisplayBalance(await contract.amountRequired(), 18)));
        node.price = amountRequired;
        node.lifeSpan = lifespan;
        node.roiPeriod = roiTime;
      }
      return twistedNodesUpdated;
    }
    
    async purchaseTwistedNode(rewardTokenName: string, price: number, nodeName: string): Promise<TransactionResponse> {
      const contract = this.basedFinance.contracts[nodeName];
      let rewardTokenIndex = -1;
      let tx;

      if( !contract ){
        console.error("Invalid node name");
        return tx;
      }

      for( let i = 0; i < this.rewardTokens.length; i++ ){
        if( this.rewardTokens[i].isActive && this.rewardTokens[i].tokenName === rewardTokenName ){
          rewardTokenIndex = i; //WARNING BUG
        }
      }
      if( rewardTokenIndex === -1 ){
        console.error("Invalid token index");
        return tx;
      }
      return await contract.deposit(rewardTokenIndex);
    }

    async updateActiveNodeInfo(nodeInfo: ActiveNodeInfo): Promise<ActiveNodeInfo> {
      const contract = this.basedFinance.contracts[nodeInfo.nodeName];
      const nodeInfoUpdated = nodeInfo;

      if(!contract)
        return nodeInfo;

      const roiTime = await contract.roiTime();

      const timeNodeRoi = nodeInfoUpdated.depositTime + Number(roiTime);
      const currentTime = Math.floor(Date.now()/1000);

      if( currentTime > timeNodeRoi ){
        nodeInfoUpdated.isRoiState = false;
        nodeInfoUpdated.currentReward = nodeInfoUpdated.reward
      }
      let claimableReward = BigNumber.from(0);

      try{
        claimableReward = await contract.getPendingRewards(nodeInfo.index, this.basedFinance.myAccount);
      }
      catch(e){

      }
      // const claimableReward = await contract.getPendingRewards(nodeInfo.index, this.basedFinance.myAccount);
      const claimableRoi = await contract.getPendingDepositAmount(nodeInfo.index, this.basedFinance.myAccount);

      nodeInfoUpdated.claimableReward =  claimableReward.eq(0) ? 0 : Number(getDisplayBalance(claimableReward, 6));
      nodeInfoUpdated.claimableRoi =  Number(getDisplayBalance(claimableRoi, 18));
      return nodeInfoUpdated;
    }

    async getActiveNodesCount(depositToken: string, twistedNodesInfo: TwistedNodesInfo[]): Promise<number> {
      let activeNodesCount = 0;
      for( let i = 0; i < twistedNodesInfo.length; i++ ){
        const currentTwistedNode = twistedNodesInfo[i];
        const contract = this.basedFinance.contracts[currentTwistedNode.nodeName];
        if( contract ){
          const activeNodesBalance = Number(await contract.getNodesOfUser());
          activeNodesCount+=activeNodesBalance;
        }
      }
      return activeNodesCount;
    }

    async getTwistedNodeBalance(depositToken: string, twistedNodesInfo: TwistedNodesInfo): Promise<boolean> {
      let twistedNodeBalance = 0;

      const contract = this.basedFinance.contracts[twistedNodesInfo.nodeName];
      let isAvailable = true;

      if( contract ){
        const totalRewardDebtInDollars = Number(getDisplayBalance(await contract.totalRewardDebtInDollars(), 6))
        const usdcBalance = Number(getDisplayBalance(await this.basedFinance.USDC.balanceOf(contract.address), 6));
        const rfv = twistedNodesInfo.price * Number((await this.basedFinance.getSmeltStat()).priceInDollars);
        // console.log(twistedNodesInfo.nodeName)
        // console.log("totalRewardDebt ", totalRewardDebtInDollars);
        // console.log("usdcBalance ", usdcBalance);
        // console.log("rfv  ", rfv);
        const availableUsdc = usdcBalance - totalRewardDebtInDollars;
        if( availableUsdc < rfv )
          isAvailable = false;
        
      }
      return isAvailable;
    }

    async getActiveTwNodeInfo(index: number, contract: any, currentTime: number, roiTime: number, currentTwistedNode: TwistedNodesInfo, depositToken: string, testType: number ): Promise<ActiveNodeInfo>
    {
      try{
        let test = index;
        let isReverted = false;
        const activeNode = await contract.userInfo(this.basedFinance.myAccount, test)
        if( activeNode ){
          if( !activeNode.retired ){
            let claimableReward = BigNumber.from(0);
            try{
              claimableReward = await contract.getPendingRewards(test, this.basedFinance.myAccount);
            }
            catch(e){
              isReverted = true;
            }
            //const claimableReward = await contract.getPendingRewards(test, this.basedFinance.myAccount);
            const lifespan = await contract.lifeSpan();
            const claimableRoi = await contract.getPendingDepositAmount(test, this.basedFinance.myAccount);
            const depositTime = Number(activeNode.depositTime)
            const rewardToken = this.rewardTokens[Number(activeNode.rewardTokenId)].tokenName;
            let nodeStateRoi = true;

            const timeNodeLife = depositTime + Number(lifespan);
            const timeNodeRoi = depositTime + Number(roiTime);

            if( currentTime > timeNodeRoi ){
              nodeStateRoi = false;
            }
            //  isReverted = true;

            let type = 0;

            if( currentTwistedNode.type === "SHORT"){
              type = 0;
            }else if( currentTwistedNode.type === "MEDIUM"){
              type = 1;
            }else if( currentTwistedNode.type === "LONG"){
              type = 2;
            }
            return {
              reward: rewardToken,
              value: 0,
              currentReward: nodeStateRoi ? depositToken : rewardToken,
              type: type,
              index: test,
              amountDeposited: Number(getDisplayBalance(activeNode.amountDeposited, 18)),
              amountClaimed: Number(getDisplayBalance(activeNode.amountClaimed, 18)),
              depositTime: depositTime,
              riskFreeValueUSDC: Number(getDisplayBalance(activeNode.riskFreeValueUSDC, 6)),
              rewardClaimedInDollars: Number(getDisplayBalance(activeNode.rewardClaimedInDollars, 6)),
              rewardClaimedInRewardToken : Number(getDisplayBalance(activeNode.rewardClaimedInRewardToken, 18)),
              retired: activeNode.retired,
              claimableReward: Number(getDisplayBalance(claimableReward, 6)),
              claimableRoi: claimableReward.eq(0) ? 0 : Number(getDisplayBalance(claimableRoi, 18)),
              isRoiState: nodeStateRoi,
              nodeName: currentTwistedNode.nodeName,
              timeNodeRoi: timeNodeRoi,
              timeNodeEnd: timeNodeLife,
              isReverted: isReverted
            }
          }
        }
      }
      catch(err){
      }
    }

    async getActiveTwistedNodesInfo(depositToken: string, twistedNodesInfo: TwistedNodesInfo[], index: number): Promise<ActiveNodeInfo[]> {
      let activeNodeInfo: ActiveNodeInfo[] = []

      for( let i = 0; i < twistedNodesInfo.length; i++ ){
        const currentTwistedNode = twistedNodesInfo[i];
        const contract = this.basedFinance.contracts[currentTwistedNode.nodeName];
  
         await this.getTwistedNodesRewardTokens('SMELT')

        if(!contract && this.rewardTokens.length === 0)
          break;

        const roiTime = await contract.roiTime();
        const currentTime = Math.floor(Date.now()/1000);
  
        let activeNodesBalance = await contract.getNodesOfUser();

        // if( currentTwistedNode.type === "LONG"){
        //   activeNodesBalance = 15
        // }
  
        let test = 0;
        const promises = [];

        for( let j = 0; j < activeNodesBalance; j++ ){
          promises.push(this.getActiveTwNodeInfo(j,contract,currentTime,roiTime,currentTwistedNode,depositToken,0));
        }

        // if( currentTwistedNode.type === "LONG"){
        //   activeNodesBalance = 20
        // }

        // for( let j = 0; j < activeNodesBalance; j++ ){
        //   promises.push(this.getActiveTwNodeInfo(j,contract,currentTime,roiTime,currentTwistedNode,depositToken,1));
        // }

        // if( currentTwistedNode.type === "LONG"){
        //   activeNodesBalance = 5
        // }

        // for( let j = 0; j < activeNodesBalance; j++ ){
        //   promises.push(this.getActiveTwNodeInfo(j,contract,currentTime,roiTime,currentTwistedNode,depositToken,2));
        // }

        await Promise.all(promises)
        .then((results) => {
            // console.log("All done", results);
            results.forEach((res) => {
              if(res){
                // console.log(res)
                activeNodeInfo.push(res)
              }
            })
        })
        .catch((e) => {
            // Handle errors here
        });

      }


      return activeNodeInfo;
    }
    async claimAllFromTwistedNode(depositToken: string, nodesInfo: ActiveNodeInfo[],
       rewardToken: string, isClaimReward: boolean): Promise<TransactionResponse> {
      let tx;

      let nodesIndexToClaim = [];
      let minAmountForTokens = [];
      var isReward = false;

      if( nodesInfo.length > 0 ){
        const contract = this.basedFinance.contracts[nodesInfo[0].nodeName];
        const abi = this.basedFinance.abis[nodesInfo[0].nodeName];
        console.log(nodesInfo[0].nodeName)


        if( contract ){

          for( let i = 0; i < nodesInfo.length; i++ ){
            const node = nodesInfo[i];
            nodesIndexToClaim.push(node.index);
            minAmountForTokens.push(0);
          }

          if( nodesIndexToClaim.length > 0 ){
            console.log(nodesIndexToClaim.length)

            if( !isClaimReward ){
              return await contract.claimAllRoi(nodesIndexToClaim);
            }else {
              return await contract.claimAllReward(nodesIndexToClaim, minAmountForTokens);
            }
          }
        }
      }
       return tx;
    }
}  