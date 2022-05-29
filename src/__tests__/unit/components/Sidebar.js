import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { SideBar } from '../../../components/SideBar/SideBar';
import { UseWalletProvider } from 'use-wallet';
import { BrowserRouter as Router } from 'react-router-dom';

describe('<Sidebar>', () => {
    it('Should render with default title and desc', () => {
        const { getByTestId } = render(
            <UseWalletProvider>
                <Router>
                    <SideBar data-testid="test-sidebar" />
                </Router>
            </UseWalletProvider>
        );

        const component = getByTestId('test-sidebar');

        expect(component.children[0].children[0].innerHTML).toBe(
            'Yield Aggregator for Best Stablecoin Staking'
        );

        expect(
            component.children[0].children[1].innerHTML.indexOf('Zunami is the DAO that works with')
        ).not.toBe(-1);

        expect(component.children[0].children[0].innerHTML).toBe(
            'Yield Aggregator for Best Stablecoin Staking'
        );
    });
});
