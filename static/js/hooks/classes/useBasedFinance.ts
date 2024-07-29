import { useContext } from 'react';
import { Context } from '../../contexts/BasedFinanceProvider';

const useBasedFinance = () => {
  const { basedFinance } = useContext(Context);
  return basedFinance;
};

export default useBasedFinance;
