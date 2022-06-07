import { render } from '@testing-library/react';
import {
    Form,
    getDepositValidationError,
    getWithdrawValidationError,
} from '../../../components/Form/Form';
import { UseWalletProvider } from 'use-wallet';
import BigNumber from 'bignumber.js';

describe('<Form>', () => {
    it('Validation test', () => {
        expect(getDepositValidationError('', '', '', true, false, false)).toBe(
            'Please, enter the amount of stablecoins to deposit'
        );

        expect(getDepositValidationError('1', '1', '1', true, false, true)).toBe(
            "You're trying to deposit more than you have"
        );

        expect(getDepositValidationError('1', '1', '1', false, false, false)).toBe(
            'You have to approve your funds before the deposit'
        );

        expect(getWithdrawValidationError('', '', '', '', new BigNumber(0), new BigNumber(0))).toBe(
            'Please, enter the amount to withdraw'
        );

        expect(
            getWithdrawValidationError('1', '1', '1', '', new BigNumber(1), new BigNumber(10))
        ).toBe("You're trying to withdraw more than you have");

        expect(
            getWithdrawValidationError('1', '1', '1', '0', new BigNumber(20), new BigNumber(10))
        ).toBe('You have zero LP shares');
    });

    it('Render deposit form', () => {
        const { getByTestId } = render(
            <UseWalletProvider>
                <Form
                    data-testid="test-form"
                    operationName="deposit"
                    directOperation={true}
                    dai={'0'}
                    usdc={'0'}
                    usdt={'0'}
                    lpPrice={new BigNumber(1)}
                />
            </UseWalletProvider>
        );
        const component = getByTestId('test-form');
        // expect(component.children[1].innerHTML).toBe('Please, wait...');
    });
});
