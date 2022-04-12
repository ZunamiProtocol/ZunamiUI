import { useContext } from 'react';
import { Context } from '../contexts/EthereumExplorerProvider';

const useEthExplorer = () => {
    const explorer = useContext(Context);
    return explorer;
};

export default useEthExplorer;
