import { useState, useEffect } from 'react';
import { Header } from '../components/Header/Header';
import { SideBar } from '../components/SideBar/SideBar';
import './Staking.scss';
import { Container, Row, Col } from 'react-bootstrap';
import { HistoryTable } from '../components/HistoryTable/HistoryTable';
import { TestnetPlaceholder } from '../components/TestnetPlaceholder/TestnetPlaceholder';
import { getTestnetStatusUrl } from '../api/api';
import { useWallet } from 'use-wallet';
import { LockedCoinInput } from '../components/Staking/LockedCoinInput/LockedCoinInput';
import { ClaimItem } from '../components/Staking/ClaimItem/ClaimItem';
import { UnclaimedGiftIcon } from '../components/UnclaimedGiftIcon/UnclaimedGiftIcon';

/* Mock data for table */
const historyItems = [
    {
        value: 1200,
        canUnlock: false,
        lockDate: 1642761600,
        unlockDate: 1642761600,
    },
    {
        value: 1200,
        canUnlock: true,
        lockDate: 1642779900,
        unlockDate: 1642779900,
    },
];

export const Staking = (): JSX.Element => {
    const { account } = useWallet();
    const [testnetStatus, setTestnetStatus] = useState(false);

    useEffect(() => {
        async function getStatus() {
            if (!account) {
                return false;
            }

            const response = await fetch(getTestnetStatusUrl(account));
            const data = await response.json();
            setTestnetStatus(data.active);
        }

        getStatus();
    }, [account]);

    return (
        <Container className={'h-100 d-flex justify-content-between flex-column'}>
            <Header />
            <Row className={'h-100 mb-4 main-row'}>
                <SideBar isMainPage={true} />
                <Col className={'content-col'}>
                    <Row className={'h-100 operation-col'}>
                        <Col className={'ps-0 pe-0'}>
                            {!testnetStatus && (
                                <TestnetPlaceholder
                                    headerTitle="Staking"
                                    title="Staking ZUN is available only to Testnet users for now"
                                />
                            )}
                            {testnetStatus && (
                                <div className="Staking">
                                    <div className="Staking__Title">Staking ZUN</div>
                                    <div className="d-flex">
                                        <div className="Staking__Locked">
                                            <div className="Staking__Locked__Title">Locked</div>
                                            <div className="Staking__Locked__Range">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="16"
                                                    defaultValue="8"
                                                />
                                            </div>
                                            <div className="Staking__Locked__Period">
                                                <span>Lock for </span>
                                                <span className="active">8 weeks</span>
                                            </div>
                                            <LockedCoinInput
                                                value={0}
                                                token="ZUN"
                                                icon="/zun-token2.svg"
                                            />
                                            <button>Lock</button>
                                        </div>
                                        <div className="Staking__Unclaimed">
                                            <div className="Staking__Unclaimed__Title">
                                                Unclaimed Staking Rewards
                                            </div>
                                            <ClaimItem zun={1300.54} usd={4504.6} />
                                            <ClaimItem zun={1300.54} usd={4504.6} />
                                            <UnclaimedGiftIcon className="Staking__Unclaimed__ICON" />
                                        </div>
                                    </div>
                                    <div className="DepositStory">
                                        <div className="DepositStory__Title">Staking history</div>
                                        <HistoryTable data={historyItems} />
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
