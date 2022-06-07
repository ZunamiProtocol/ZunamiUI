import { render } from '@testing-library/react';
import { Input } from '../../../components/Form/Input/Input';

describe('<Input>', () => {
    it('Should render with default zero', () => {
        const { getByTestId } = render(<Input data-testid="test-input" name="USDC" />);
        const component = getByTestId('test-input');
        expect(component.children[1].innerHTML).toBe('USDC');
    });

    // it('Should render without text', () => {
    //     const { getByTestId } = render(<Preloader data-testid="test-preloader" onlyIcon />);
    //     const component = getByTestId('test-preloader');
    //     expect(component.children.length).toBe(1);
    // });
});
