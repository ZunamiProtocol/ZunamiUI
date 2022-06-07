import { render } from '@testing-library/react';
import { WalletStatus } from '../../../components/WalletStatus/WalletStatus';
import { UseWalletProvider } from 'use-wallet';
import { renderHook } from '@testing-library/react-hooks';
import { useWallet } from 'use-wallet';

describe('<WalletStatus>', () => {
    it('Should render with default connect wallet text', () => {
        const { getByTestId } = render(
            <UseWalletProvider>
                <WalletStatus data-testid="test-wallet-status" />
            </UseWalletProvider>
        );

        const component = getByTestId('test-wallet-status');

        expect(component.children[0].value).toBe('Connect wallet');
    });

    it('Should render with connected wallet', () => {
        // const { result } = renderHook(useWallet, {});
        // console.log(result.current);
        const { getByTestId } = render(
            <UseWalletProvider>
                <WalletStatus data-testid="test-wallet-status" />
            </UseWalletProvider>
        );

        const component = getByTestId('test-wallet-status');

        expect(component.children[0].value).toBe('Connect wallet');
    });
});
