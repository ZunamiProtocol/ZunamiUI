import { Address, sepolia, useAccount, useNetwork } from 'wagmi';
import sepControllerAbi from '../actions/abi/sepolia/controller.json';
import { useMemo } from 'react';
import { contractAddresses } from '../sushi/lib/constants';
import BigNumber from 'bignumber.js';
import {
    DAI_TOKEN_DECIMAL,
    DEFAULT_TOKEN_DECIMAL,
    NULL_ADDRESS,
    USDT_TOKEN_DECIMAL,
} from '../utils/formatbalance';
import { walletClient } from '../config';
import { log } from '../utils/logger';
import { getZapAddress, getZunStakingAddress } from '../utils/zunami';
import stakingAbi from '../actions/abi/sepolia/staking.json';

const useStake = (
    coinIndex: number,
    depositSum: string,
    receiver: Address,
    stakingMode: string
) => {
    const { chain } = useNetwork();
    const chainId = chain ? chain.id : undefined;
    const { address: account } = useAccount();

    const contractAddress = useMemo(() => {
        if (coinIndex === 4) {
            // APS zunUSD deposit
            if (!chainId) {
                return contractAddresses.aps[1];
            }

            return contractAddresses.aps[chainId];
        } else if (coinIndex === 5) {
            // APS zunETH deposit
            if (!chainId) {
                return contractAddresses.ethAps[1];
            }

            return contractAddresses.ethAps[chainId];
        } else {
            // ZAP deposit
            return getZapAddress(chainId, stakingMode);
        }
    }, [chainId, coinIndex, stakingMode]);

    let preparedAmounts = [
        new BigNumber(0).toString(),
        new BigNumber(0).toString(),
        new BigNumber(0).toString(),
        new BigNumber(0).toString(),
        new BigNumber(0).toString(),
    ];

    const tokenDecimals = useMemo(() => {
        if (!chainId || contractAddress === contractAddresses.aps[chainId]) {
            return DEFAULT_TOKEN_DECIMAL;
        }

        if (chainId === sepolia.id) {
            switch (coinIndex) {
                case 0:
                    return DAI_TOKEN_DECIMAL;
                case 1:
                    return USDT_TOKEN_DECIMAL;
                case 2:
                    return USDT_TOKEN_DECIMAL;
                default:
                    return USDT_TOKEN_DECIMAL;
            }
        } else {
            switch (coinIndex) {
                case 0:
                    return DAI_TOKEN_DECIMAL;
                case 1:
                    return USDT_TOKEN_DECIMAL;
                case 2:
                    return USDT_TOKEN_DECIMAL;
                default:
                    return USDT_TOKEN_DECIMAL;
            }
        }
    }, [coinIndex, chainId, contractAddress]);

    if (coinIndex !== 4) {
        // everything else
        preparedAmounts[coinIndex] = new BigNumber(depositSum).times(tokenDecimals).toString();
    } else {
        // zunUSD APS staking
        preparedAmounts[0] = new BigNumber(depositSum).times(tokenDecimals).toString();
    }

    // APS deposit
    async function onStake() {
        log(`${contractAddress}.deposit([${preparedAmounts}], '${receiver}')`);
        return await walletClient.writeContract({
            address: contractAddress,
            chain: chain,
            abi: sepControllerAbi,
            functionName: 'deposit',
            args: [preparedAmounts, receiver],
            account: account || NULL_ADDRESS,
        });
    }

    // https://github.com/ZunamiProtocol/ZunamiProtocolV2/commit/2e33ac81ed81fe303b6427d085020eaa6694b85d
    // Там сейчас один пул с APS LP токеном

    // Тебе важно юзать следующие методы:
    // 1/ function deposit(uint256 _pid, uint256 _amount)
    // депонием токен в нашем случа это первй пул ( 0 pid ) и указывает количество
    // Перед исполнение депозита естесвенно апрувим APS LP токен на стейкинг

    // 2/ function withdraw(uint256 _pid, uint256 _amount) - аналогично указывает пул ID ( 0 ) и количество APS LP которые хотим забрать
    // 3/ function claimAll() - забираем реворды

    // Staking #1
    async function stakingDeposit() {
        const stakingAddress = getZunStakingAddress(chainId);
        const amount = '100000'; //new BigNumber(depositSum).times(tokenDecimals).toString();
        log(`Staking(${stakingAddress}).deposit(0, ${amount})`);

        return await walletClient.writeContract({
            address: stakingAddress,
            chain: chain,
            abi: stakingAbi,
            functionName: 'deposit',
            args: [0, amount],
            account: account || NULL_ADDRESS,
        });
    }

    return {
        deposit: onStake,
        stakingDeposit,
    };
};

export default useStake;
