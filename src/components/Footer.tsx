import pkg from '@/package.json';
import type { Route } from 'next';
import Link from 'next/link';
import { Col, Container, Row } from 'react-bootstrap';
import { BsGithub } from 'react-icons/bs';

function getYear() {
  const startYear = 2026;
  const currentYear = new Date().getFullYear();
  return currentYear > startYear
    ? `${startYear} - ${currentYear}`
    : `${startYear}`;
}

export default function Footer() {
  return (
    <footer className={'bg-body-tertiary py-3 mt-auto'}>
      <Container className={'text-muted text-center'}>
        <Row className={'align-items-center gy-2'}>
          <Col md={4} className='text-md-start'>
            &copy; {getYear()} {pkg.author.name}. All rights reserved.
          </Col>
          <Col md={4}>
            Version: <strong>{pkg.version}</strong>
          </Col>
          <Col md={4} className='text-md-end'>
            <Link
              href={pkg.repository.url as Route}
              target='_blank'
              rel='noopener noreferrer'
              className='text-reset text-decoration-none'
              aria-label='GitHub repository (opens in a new tab)'
            >
              <BsGithub aria-hidden='true' />
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
