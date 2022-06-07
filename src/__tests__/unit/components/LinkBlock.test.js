import { render } from '@testing-library/react';
import { LinkBlock } from '../../../components/LinkBlock/LinkBlock';

describe('<LinkBlock>', () => {
    it('Should render with default text', () => {
        const { getByTestId } = render(
            <LinkBlock data-testid="test-link-block" title="Test link" soon={false} />
        );
        const component = getByTestId('test-link-block');
        expect(component.children[1].innerHTML).toBe('Test link');
        expect(component.children.length).toBe(2);
    });
});
