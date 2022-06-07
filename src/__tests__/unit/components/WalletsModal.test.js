import { render } from '@testing-library/react';
import {
    WalletsModal,
    getActiveWalletName,
    getActiveWalletAddress,
} from '../../../components/WalletsModal/WalletsModal';
import { UseWalletProvider } from 'use-wallet';

beforeEach(() => {
    Object.defineProperty(window, 'ethereum', {});

    // jest.mock('react-router-dom');

    // const pushMock = jest.fn();
    // reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock });
});

describe('<WalletsModal>', () => {
    it('Default wallet type is empty', () => {
        expect(getActiveWalletName()).toBe(null);
    });

    it('Default wallet address is empty', () => {
        expect(getActiveWalletAddress()).toBe(null);
    });

    it('Should render with show state', () => {
        const { getByTestId } = render(
            <UseWalletProvider>
                <WalletsModal data-testid="test-wmodal" show={true} />
            </UseWalletProvider>
        );
        const component = getByTestId('test-wmodal');

        expect(component.children[0].children[0].children[0].innerHTML).toBe('Connect a wallet');
        expect(component.children[0].children[1].children.length).toBe(3);
    });
});
