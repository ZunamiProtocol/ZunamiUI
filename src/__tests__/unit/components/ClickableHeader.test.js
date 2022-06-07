import { render } from '@testing-library/react';
import { ClickableHeader } from '../../../components/ClickableHeader/ClickableHeader';

describe('<ClickableHeader>', () => {
    it('Should render with default text', () => {
        const { getByTestId } = render(<ClickableHeader data-testid="test-c-header" name="Test" />);
        const component = getByTestId('test-c-header');
        expect(component.children[0].innerHTML).toBe('Test');
    });
});
