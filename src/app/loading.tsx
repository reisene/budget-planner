import { Container, Spinner } from 'react-bootstrap';

export default function Loading() {
  return (
    <Container className={'py-5 page-medium text-center'}>
      <Spinner animation='border' role='status' variant='primary'>
        <span className='visually-hidden'>Loading...</span>
      </Spinner>
    </Container>
  );
}
