import { render } from '@testing-library/react';
import {
    FastDepositForm,
    coinNameToAddress,
} from '../../../components/FastDepositForm/FastDepositForm';
import { UseWalletProvider } from 'use-wallet';
import { BrowserRouter as Router } from 'react-router-dom';

describe('<FastDepositForm>', () => {
    it('Should render with default text', () => {
        const { getByTestId } = render(
            <UseWalletProvider>
                <Router>
                    <FastDepositForm data-testid="test-form" />
                </Router>
            </UseWalletProvider>
        );
        const component = getByTestId('test-form');
        expect(component.children[1].children[0].innerHTML).toBe('Fast deposit');
        expect(component.children[1].children[1].innerHTML).toBe(
            'Tap to Deposit &amp; Withdraw Page'
        );
        expect(component.children[3].classList.contains('FastDepositInput')).toBe(true);

        const inputBlock = component.children[3];
        expect(inputBlock.children[3].value).toBe('USDC');

        const button = component.children[4].children[0];
        expect(button.children[0].children[0].value).toBe('Connect wallet');
        expect(button.children[1].innerHTML).toBe('Make your first Deposit!');
    });

    it('Should convert coin name to address', () => {
        expect(coinNameToAddress('USDC')).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
        expect(coinNameToAddress('USDT')).toBe('0xdac17f958d2ee523a2206206994597c13d831ec7');
    });
});
