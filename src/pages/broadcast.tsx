import React from 'react';
import { Button, Input, Stack, Box, Text } from '@blockstack/ui';
import { useFormik } from 'formik';
import fetch from 'isomorphic-unfetch';

export const BroadcastPage = () => {
  const formik = useFormik({
    initialValues: {
      sender_key: 'b8d99fd45da58038d630d9855d3ca2466e8e0f89d3894c4724f0efc9ff4b51f001',
      recipient_address: 'ST2YFCYFD76CP80NR6VSFFZEXXF9YMCDAQE7DNZP7',
      stx_amount: 100,
      fee_rate: 9,
      nonce: 0,
      memo: '',
    },
    onSubmit: async value => {
      console.log(value);
      await fetch('http://localhost:3999/debug/broadcast/token-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(value),
      });
    },
  });
  return (
    <Box m="base-loose">
      <form onSubmit={formik.handleSubmit}>
        <Text as="h1" textStyle="display">
          Token transfer
        </Text>
        <Stack spacing="base" maxWidth="544px">
          <label>
            Sender Key
            <Input
              type="text"
              value={formik.values.sender_key}
              onChange={formik.handleChange}
              placeholder="Sender key"
            />
          </label>
          <Input
            type="text"
            value={formik.values.recipient_address}
            onChange={formik.handleChange}
            placeholder="Recipient address"
          />
          <Input
            type="text"
            value={formik.values.stx_amount}
            onChange={formik.handleChange}
            placeholder="uSTX amount"
          />
          <Input type="text" value={formik.values.fee_rate} onChange={formik.handleChange} placeholder="uSTX tx fee" />
          <Input type="text" value={formik.values.nonce} onChange={formik.handleChange} placeholder="Nonce" />
          <Input type="text" value={formik.values.memo} onChange={formik.handleChange} placeholder="Memo" />
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </Box>
  );
};

export default BroadcastPage;
