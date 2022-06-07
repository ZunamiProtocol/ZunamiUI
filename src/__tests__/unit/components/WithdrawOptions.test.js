import { useState } from 'react';
import { render, fireEvent } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import {
    WithdrawOptions,
    coinSelectHandler,
} from '../../../components/Form/WithdrawOptions/WithdrawOptions';

describe('<WithdrawOptions>', () => {
    it('Should render with default text', () => {
        const { getByTestId } = render(
            <WithdrawOptions
                data-testid="test-w-options"
                coinsSelectionEnabled={true}
                sharePercent={100}
                balance={new BigNumber(1)}
            />
        );
        const component = getByTestId('test-w-options');
        expect(component.children[0].children[0].innerHTML).toBe('Your balance:');
        expect(component.children[0].children[1].innerHTML).toBe('0.000');
    });

    it('Check coin selection handler', () => {
        coinSelectHandler('DAI', (value) => {
            expect(value).toBe('DAI');
        });
    });

    it('Should react to input change', () => {
        let sharePercent = 100;

        const { getByTestId } = render(
            <WithdrawOptions
                data-testid="test-w-options"
                coinsSelectionEnabled={true}
                sharePercent={sharePercent}
                onShareSelect={(percent) => {
                    sharePercent = percent;
                }}
                balance={new BigNumber(1)}
            />
        );
        const component = getByTestId('test-w-options');
        const input = component.children[1].children[1];
        fireEvent.change(input, { target: { value: '23' } });
        expect(sharePercent).toBe('23');
    });

    it('Should handle max input', () => {
        let sharePercent = 100;

        const { getByTestId } = render(
            <WithdrawOptions
                data-testid="test-w-options"
                coinsSelectionEnabled={true}
                sharePercent={sharePercent}
                onShareSelect={(percent) => {
                    sharePercent = percent;
                }}
                balance={new BigNumber(1)}
            />
        );
        const component = getByTestId('test-w-options');
        const input = component.children[1].children[1];
        fireEvent.change(input, { target: { value: '234' } });
        expect(sharePercent).toBe(100);
    });
});
