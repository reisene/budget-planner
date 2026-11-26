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
          <aside aria-labelledby='contact-options-title'>
            <Card className='h-100'>
              <CardBody className='p-4'>
                <div className='mb-4'>
                  <CardTitle
                    as='h2'
                    id='contact-options-title'
                    className='h4 mb-2'
                  >
                    Other ways to get in touch
                  </CardTitle>
                  <p className='text-body-secondary mb-0'>
                    Choose the route that works best for you.
                  </p>
                </div>
                <div className='d-grid'>
                  <section
                    aria-labelledby='contact-author'
                    className='border-bottom pb-3 mb-3'
                  >
                    <h3 id='contact-author' className='h5 fw-bold mb-2'>
                      <BsPersonCircle
                        className='me-2 text-primary'
                        aria-hidden='true'
                      />
                      Author
                    </h3>
                    <p className='mb-1'>{pkg.author.name}</p>
                    <a href={`mailto:${pkg.author.email}`}>
                      <BsEnvelopeAtFill
                        className='me-1 text-primary'
                        aria-hidden='true'
                      />
                      {pkg.author.email}
                    </a>
                  </section>
                  <section
                    aria-labelledby='contact-bug'
                    className='border-bottom pb-3 mb-3'
                  >
                    <h3 id='contact-bug' className='h5 fw-bold mb-2'>
                      <BsBugFill
                        className='me-2 text-danger'
                        aria-hidden='true'
                      />
                      Found a bug?
                    </h3>
                    <div className='d-flex flex-wrap gap-2'>
                      <Button
                        href={pkg.bugs.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        variant='primary'
                      >
                        <BsGithub className='me-1' aria-hidden='true' />
                        GitHub Issues
                        <span className='visually-hidden'>
                          {' '}
                          (opens in new tab)
                        </span>
                      </Button>
                      <Button
                        href={`mailto:${pkg.bugs.email}`}
                        variant='primary'
                      >
                        <BsEnvelopeAtFill className='me-1' aria-hidden='true' />
                        Email bug report
                      </Button>
                    </div>
                  </section>
                  <section
                    aria-labelledby='contact-support'
                    className='border-bottom pb-3 mb-3'
                  >
                    <h3 id='contact-support' className='h5 fw-bold mb-2'>
                      <BsHeartFill
                        className='me-2 text-danger'
                        aria-hidden='true'
                      />
                      Support the project
                    </h3>
                    <div className='d-flex flex-wrap gap-2'>
                      {patreon && (
                        <Button
                          href={patreon}
                          target='_blank'
                          rel='noopener noreferrer'
                          variant='primary'
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
                          variant='primary'
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
                    <h3 id='contact-source' className='h5 fw-bold mb-2'>
                      <BsGithub className='me-2 text-body' aria-hidden='true' />
                      Source code
                    </h3>
                    <a href={repoUrl} target='_blank' rel='noopener noreferrer'>
                      View repository on GitHub
                      <BsBoxArrowUpRight className='ms-1' aria-hidden='true' />
                      <span className='visually-hidden'>
                        {' '}
                        (opens in new tab)
                      </span>
                    </a>
                  </section>
                </div>
              </CardBody>
            </Card>
          </aside>
        </Col>
      </Row>
    </Container>
  );
}
