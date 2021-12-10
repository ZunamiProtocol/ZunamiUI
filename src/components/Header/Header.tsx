import React, {useState} from 'react';
import {WalletStatus} from '../WalletStatus/WalletStatus';
import './Header.scss';
import {Navbar, Container, Modal} from 'react-bootstrap';
import {Disclaimer} from '../Disclaimer/Disclaimer';
import {HowToUse} from '../HowToUse/HowToUse';
import {ThemeSwitcher} from '../ThemeSwitcher/ThemeSwitcher';

export const Header = (): JSX.Element => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const logoVariant = document.body.classList.contains('dark') ? 'logo-dark.svg' : 'logo.svg';

    return (
        <Navbar expand="lg" className={'header'}>
            <Container className={'mt-3 header-container'}>
                <Navbar.Brand href="/">
                    <img className={'Logo'} src={logoVariant} alt="Logo of the Zunami Protocol"/>
                </Navbar.Brand>
                <Navbar.Collapse className="d-flex justify-content-end align-items-center zun-gap">
                    <div className={'d-none d-sm-block'}>
                        <Disclaimer
                            text={'Please note. This is a beta version. The contract has not been auditied yet. Use it at your own risk.'}
                        />
                    </div>
                    <HowToUse onClick={handleShow}/>
                    <ThemeSwitcher/>
                    <WalletStatus/>
                </Navbar.Collapse>
            </Container>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>How to use</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/GHwZ16gPzVQ"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </Modal.Body>
            </Modal>
        </Navbar>
    );
};
