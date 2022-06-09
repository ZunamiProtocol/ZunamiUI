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

        const sidebar = component.children[0].children[2];

        const tvlBlock = sidebar.children[0];
        expect(tvlBlock.children[0].textContent).toBe('Total Value Locked');
        expect(tvlBlock.children[1].outerHTML).toBe('<div class="preloader mt-3"></div>');

        const apyBlock = sidebar.children[1];
        expect(apyBlock.children[0].children[0].textContent).toBe('Base APY');
        expect(apyBlock.children[0].children[1].children[0].tagName).toBe('IMG'); // hint icon
        expect(apyBlock.children[1].outerHTML).toBe('<div class="preloader mt-3"></div>');

        const rewardBlock = sidebar.children[2];
        expect(rewardBlock.children[0].textContent).toBe('Reward APY');
        expect(rewardBlock.children[1].textContent).toBe('Soon');
    });
});
