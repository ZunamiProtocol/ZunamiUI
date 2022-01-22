import './Header.scss';
import {Navbar, Container} from 'react-bootstrap';

export const Header = (): JSX.Element => {
    const logoVariant = document.body.classList.contains('dark') ? 'logo-dark.svg' : 'logo.svg';

    return (
        <Navbar expand="lg" className={'header'}>
            {/* <Container className={'header-container'}> */}
                <Navbar.Brand href="https://zunami.io">
                    <img className={'Logo'} src={logoVariant} alt="Logo of the Zunami Protocol"/>
                </Navbar.Brand>
            {/* </Container> */}
        </Navbar>
    );
};
