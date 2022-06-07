import { render } from '@testing-library/react';
import { ActionSelector } from '../../../components/Form/ActionSelector/ActionSelector';

describe('<ActionSelector>', () => {
    it('Should render with deposit state', () => {
        const { getByTestId } = render(
            <ActionSelector data-testid="test-d-action" value="deposit" />
        );
        const component = getByTestId('test-d-action');

        expect(component.children[0].classList.contains('ActionSelector__Action__Active')).toBe(
            true
        );
        expect(component.children[1].classList.contains('ActionSelector__Action__Active')).toBe(
            false
        );
    });

    it('Should render with withdraw state', () => {
        const { getByTestId } = render(
            <ActionSelector data-testid="test-d-action" value="withdraw" />
        );
        const component = getByTestId('test-d-action');

        expect(component.children[0].classList.contains('ActionSelector__Action__Active')).toBe(
            false
        );
        expect(component.children[1].classList.contains('ActionSelector__Action__Active')).toBe(
            true
        );
    });

    it('Should render with text labels', () => {
        const { getByTestId } = render(
            <ActionSelector data-testid="test-d-action" value="withdraw" />
        );
        const component = getByTestId('test-d-action');

        expect(component.children[0].children[0].innerHTML).toBe('Deposit');
        expect(component.children[1].children[0].innerHTML).toBe('Withdraw');
    });
});
