import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Disclaimer } from '../../../src/components/Disclaimer/Disclaimer';

describe('<Disclaimer>', () => {
    it('Should render with default title and desc', () => {
        const { getByTestId } = render(
            <Disclaimer id="my-disclaimer" text="This is the default disclaimer text" />
        );

        getByTestId('my-disclaimer').children.length.should.equal(2);
        getByTestId('my-disclaimer').children[0].tagName.should.equal('svg');
        getByTestId('my-disclaimer').children[1].children[0].innerHTML.should.equal(
            'This is the default disclaimer text'
        );
    });
});
