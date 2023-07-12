import { Address } from 'wagmi';
export const SUBTRACT_GAS_LIMIT = 100000;

interface zunAddresses {
    zunami: {
        1: Address;
        56: Address;
        137: Address;
    };
    zunami_bsc_migrator: {
        v1_1_to_1_2: Address;
    };
    weth: {
        1: Address;
    };
    usdc: {
        1: Address;
    };
    busd: {
        56: Address;
    };
    uzd: {
        1: Address;
    };
    frax: {
        1: Address;
    };
    aps: {
        1: Address;
    };
    zeth: {
        1: Address;
    };
    deprecated: {
        v_1_0_bsc: Address;
        v_1_1_bsc: Address;
        v_1_0_uzd: Address;
        v_1_1_uzd: Address;
    };
    curve: {
        uzdPool: Address;
    };
}

export const contractAddresses: zunAddresses = {
    zunami: {
        // ETH
        1: '0x2ffCC661011beC72e1A9524E12060983E74D14ce',
        // BNB
        56: '0xeAC5e2b6F1d7eBF4a715a235e097b59ACa40b786',
        // Polygon
        137: '0x8141d8f73c837acab6F4736Cc51143E002985Cf5',
    },
    zunami_bsc_migrator: {
        v1_1_to_1_2: '0xBCabe08134b6895d7Da8b7a0C0241cfbD29A4bc2',
    },
    weth: {
        1: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    },
    usdc: {
        1: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    },
    busd: {
        56: '0x0aeB8D3aA2D806cb7141c1C0accFf1aC8CbCF3AD',
    },
    uzd: {
        1: '0xb40b6608B2743E691C9B54DdBDEe7bf03cd79f1c',
    },
    frax: {
        1: '0x3D8aBC464D5313a576e78706aC97F79fe1EB0b61',
    },
    aps: {
        1: '0xCaB49182aAdCd843b037bBF885AD56A3162698Bd',
    },
    zeth: {
        // 1: '0x9dE83985047ab3582668320A784F6b9736c6EEa7',
        1: '0xe47f1CD2A37c6FE69e3501AE45ECA263c5A87b2b',
    },
    deprecated: {
        v_1_0_bsc: '0x02a228D826Cbb1C0E8765A6DB6E7AB64EAA80BFD',
        v_1_1_bsc: '0xFEdcBA60B3842e3F9Ed8BC56De171da5426AF8CF',
        v_1_0_uzd: '0xe5c987f93734cb44ab03f1b18e30a374254891b6',
        v_1_1_uzd: '0x015B94AB2B0A14A96030573FBcD0F3D3d763541F',
    },
    curve: {
        uzdPool: '0xbeDca4252b27cc12ed7DaF393F331886F86cd3CE',
    },
};
