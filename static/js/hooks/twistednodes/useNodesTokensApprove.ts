import { BigNumber, ethers } from 'ethers';
import { useCallback, useMemo } from 'react';
import { useHasPendingApproval, useTransactionAdder } from '../../state/transactions/hooks';
import useAllowance from '../common/useAllowance';
import useBasedFinance from '../classes/useBasedFinance';

const APPROVE_AMOUNT = ethers.constants.MaxUint256;
const APPROVE_BASE_AMOUNT = BigNumber.from('1000000000000000000000000');

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
function useNodesTokenApprove(tokenFrom: string, spender: string): [ApprovalState, () => Promise<void>] {
  const basedFinance = useBasedFinance();
  const tokenContract = basedFinance.getTokenFromTicker(tokenFrom);

  spender = basedFinance.contracts[spender].address;

  const pendingApproval = useHasPendingApproval(tokenContract.address, spender);
  const currentAllowance = useAllowance(tokenContract, spender, pendingApproval);

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lt(APPROVE_BASE_AMOUNT)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [currentAllowance, pendingApproval]);

  const addTransaction = useTransactionAdder();

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily');
      return;
    }

    const response = await tokenContract.approve(spender, APPROVE_AMOUNT);
    addTransaction(response, {
      summary: `Approve ${tokenContract.symbol}`,
      approval: {
        tokenAddress: tokenContract.address,
        spender: spender,
      },
    });
  }, [approvalState, tokenContract, spender, addTransaction]);

  return [approvalState, approve];
}

export default useNodesTokenApprove;
