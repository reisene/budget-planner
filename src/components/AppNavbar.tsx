'use client';

import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { BsEnvelope, BsHouse, BsInfoCircle } from 'react-icons/bs';

const navLinks = [
  { href: '/', label: 'Home', icon: <BsHouse /> },
  { href: '/about', label: 'About', icon: <BsInfoCircle /> },
  { href: '/contact', label: 'Contact', icon: <BsEnvelope /> },
];
export default function AppNavbar() {
  const pathname = usePathname();
  return (
    <Navbar expand={'lg'} className={'bg-body-tertiary'}>
      <Container>
        <Navbar.Brand href='/'>Budget Planner</Navbar.Brand>
        <Navbar.Toggle aria-controls='main-navbar-nav' />
        <Navbar.Collapse id='main-navbar-nav'>
          <Nav className='me-auto' variant={'underline'} activeKey={pathname}>
            {navLinks.map((link) => (
              <Nav.Item key={link.href}>
                <Nav.Link href={link.href} eventKey={link.href}>
                  {link.icon} {link.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
