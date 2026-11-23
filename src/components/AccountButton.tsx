'use client';

import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function AccountButton({ name }: { name: string }) {
  return (
    <OverlayTrigger
      placement='bottom'
      overlay={<Tooltip id='account-tooltip'>{name}</Tooltip>}
    >
      <Button href='/account' variant='light'>
        Account
      </Button>
    </OverlayTrigger>
  );
}
