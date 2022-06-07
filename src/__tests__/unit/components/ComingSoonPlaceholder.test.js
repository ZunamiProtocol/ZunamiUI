import { render } from '@testing-library/react';
import { ComingSoonPlaceholder } from '../../../components/ComingSoonPlaceholder/ComingSoonPlaceholder';

describe('<ComingSoonPlaceholder>', () => {
    it('Should render with default text', () => {
        const { getByTestId } = render(<ComingSoonPlaceholder data-testid="test-placeholder" />);
        const component = getByTestId('test-placeholder');
        expect(component.innerHTML).toBe('Available soon');
    });
});
