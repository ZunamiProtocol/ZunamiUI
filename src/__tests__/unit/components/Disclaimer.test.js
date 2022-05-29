import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Disclaimer } from '../../../components/Disclaimer/Disclaimer';

describe('<Disclaimer>', () => {
    it('Should render with default title and desc', () => {
        const { getByTestId } = render(
            <Disclaimer data-testid="test-disclaimer" text="This is the default disclaimer text" />
        );

        const component = getByTestId('test-disclaimer');

        expect(component.children.length).toBe(2);
        expect(component.children[0].tagName).toBe('svg');
        expect(component.children[1].innerHTML).toBe('This is the default disclaimer text');
    });
});
