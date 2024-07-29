import {useContext} from 'react';
import {Context} from '../../contexts/DexProvider';

const useDex = () => {
    const {dex} = useContext(Context);
    return dex;
};

export default useDex;