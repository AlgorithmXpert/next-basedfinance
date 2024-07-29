import { useEffect, useState } from 'react';
import useBasedFinance from '../classes/useBasedFinance';
import { ShareTokenStat } from '../../based-finance/types';
import useRefresh from '../common/useRefresh';

const useSmeltStats = () => {
  const [stat, setStat] = useState<ShareTokenStat>();
  const { slowRefresh } = useRefresh();
  const basedFinance = useBasedFinance();

  useEffect(() => {
    async function fetchSharePrice() {
      try {
        setStat(await basedFinance.getSmeltStat());
      } catch(err){
        console.error(err)
      }
    }
    fetchSharePrice();
  }, [setStat, basedFinance, slowRefresh]);

  return stat;
};

export default useSmeltStats;
