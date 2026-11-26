'use client';

import { JetBrains_Mono } from 'next/font/google';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import {
  BsCreditCard,
  BsEnvelope,
  BsHouse,
  BsInfoCircle,
} from 'react-icons/bs';
import { MdOutlineDashboard } from 'react-icons/md';

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin-ext'],
  weight: ['400', '700'],
  display: 'swap',
});

const navLinks = [
  { href: '/', label: 'Home', icon: <BsHouse /> },
  { href: '/dashboard', label: 'Dashboard', icon: <MdOutlineDashboard /> },
  { href: '/about', label: 'About', icon: <BsInfoCircle /> },
  { href: '/contact', label: 'Contact', icon: <BsEnvelope /> },
  { href: '/pricing', label: 'Pricing', icon: <BsCreditCard /> },
];
export default function AppNavbar({
  authButtons,
}: {
  authButtons?: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <Navbar
      expand={'lg'}
      className={`bg-body-tertiary ${jetBrainsMono.className}`}
      sticky={'top'}
    >
      <Container>
        <Navbar.Brand href='/' className='d-flex align-items-center'>
          <Image
            src='/logo.svg'
            alt='Budget Planner Logo'
            width={40}
            height={40}
            className='d-inline-block me-2'
          />
          Budget Planner
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='main-navbar-nav' />
        <Navbar.Collapse id='main-navbar-nav' className='align-items-center'>
          <Nav
            className='me-auto align-items-center'
            variant={'underline'}
            activeKey={pathname}
          >
            {navLinks.map((link) => (
              <Nav.Item key={link.href}>
                <Nav.Link href={link.href} eventKey={link.href}>
                  {link.icon} {link.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          {authButtons}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
