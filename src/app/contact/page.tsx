import { auth } from '@/lib/auth/server';
import pkg from '@/package.json';
import type { Metadata } from 'next';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Row,
} from 'react-bootstrap';
import {
  BsBoxArrowUpRight,
  BsBugFill,
  BsEnvelopeAtFill,
  BsGithub,
  BsHeartFill,
  BsPersonCircle,
} from 'react-icons/bs';
import { SiPatreon } from 'react-icons/si';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Budget Planner author.',
};

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const { data: session } = await auth.getSession();
  const repoUrl = pkg.repository.url
    .replace(/^git\+/, '')
    .replace(/\.git$/, '');
  const patreon = pkg.funding.find((f) => f.type === 'patreon')?.url;
  const sponsors = pkg.funding.find((f) => f.type === 'github')?.url;

  return (
    <Container className='py-4'>
      <Breadcrumb listProps={{ className: 'mb-3' }}>
        <BreadcrumbItem href='/'>Home</BreadcrumbItem>
        <BreadcrumbItem active>Contact</BreadcrumbItem>
      </Breadcrumb>

      <h1 className='mb-2'>Contact</h1>
      <p className='text-body-secondary mb-4'>
        Questions, bug reports or ideas for Budget Planner? Write to us.
      </p>

      <Row className='g-4'>
        <Col lg={7}>
          <Card>
            <CardBody className='p-4'>
              <CardTitle as='h2' className='h4 mb-3'>
                Send a message
              </CardTitle>
              <ContactForm
                defaultName={session?.user?.name ?? ''}
                defaultEmail={session?.user?.email ?? ''}
              />
            </CardBody>
          </Card>
        </Col>
        <Col lg={5}>
          <aside aria-label='Other ways to get in touch'>
            <div className='d-grid gap-4'>
              <section aria-labelledby='contact-author'>
                <h2 id='contact-author' className='h5 mb-1'>
                  <BsPersonCircle className='me-2' aria-hidden='true' />
                  Author
                </h2>
                <p className='mb-1'>{pkg.author.name}</p>
                <a href={`mailto:${pkg.author.email}`}>
                  <BsEnvelopeAtFill className='me-1' aria-hidden='true' />
                  {pkg.author.email}
                </a>
              </section>
              <section aria-labelledby='contact-bug'>
                <h2 id='contact-bug' className='h5 mb-2'>
                  <BsBugFill className='me-2' aria-hidden='true' />
                  Found a bug?
                </h2>
                <div className='d-flex flex-wrap gap-2'>
                  <Button
                    href={pkg.bugs.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    variant='outline-primary'
                  >
                    <BsGithub className='me-1' aria-hidden='true' />
                    GitHub Issues
                    <span className='visually-hidden'> (opens in new tab)</span>
                  </Button>
                  <Button
                    href={`mailto:${pkg.bugs.email}`}
                    variant='outline-primary'
                  >
                    <BsEnvelopeAtFill className='me-1' aria-hidden='true' />
                    Email bug report
                  </Button>
                </div>
              </section>
              <section aria-labelledby='contact-support'>
                <h2 id='contact-support' className='h5 mb-2'>
                  <BsHeartFill className='me-2' aria-hidden='true' />
                  Support the project
                </h2>
                <div className='d-flex flex-wrap gap-2'>
                  {patreon && (
                    <Button
                      href={patreon}
                      target='_blank'
                      rel='noopener noreferrer'
                      variant='outline-primary'
                    >
                      <SiPatreon className='me-1' aria-hidden='true' />
                      Patreon
                      <span className='visually-hidden'>
                        {' '}
                        (opens in new tab)
                      </span>
                    </Button>
                  )}
                  {sponsors && (
                    <Button
                      href={sponsors}
                      target='_blank'
                      rel='noopener noreferrer'
                      variant='outline-primary'
                    >
                      <BsGithub className='me-1' aria-hidden='true' />
                      GitHub Sponsors
                      <span className='visually-hidden'>
                        {' '}
                        (opens in new tab)
                      </span>
                    </Button>
                  )}
                </div>
              </section>
              <section aria-labelledby='contact-source'>
                <h2 id='contact-source' className='h5 mb-1'>
                  <BsGithub className='me-2' aria-hidden='true' />
                  Source code
                </h2>
                <a href={repoUrl} target='_blank' rel='noopener noreferrer'>
                  View repository on GitHub
                  <BsBoxArrowUpRight className='ms-1' aria-hidden='true' />
                  <span className='visually-hidden'> (opens in new tab)</span>
                </a>
              </section>
            </div>
          </aside>
        </Col>
      </Row>
    </Container>
  );
}
