import { createEntityAdapter, createReducer, SerializedError } from '@reduxjs/toolkit';
import { Transaction } from '@models/transaction.interface';
import { fetchTransaction } from './actions';
import { HYDRATE } from 'next-redux-wrapper';

export const txAdapter = createEntityAdapter({
  selectId: (transaction: Transaction) => transaction.tx_id,
});

const initialState = txAdapter.getInitialState<{
  loading: 'idle' | 'pending' | 'rejected';
  error?: SerializedError;
  lastTxId?: string;
}>({
  loading: 'idle',
  error: undefined,
  lastTxId: undefined,
});

export const transactions = createReducer(initialState, builder => {
  builder.addCase(fetchTransaction.pending, state => {
    if (state.loading === 'idle') {
      state.loading = 'pending';
    }
  });
  builder.addCase(fetchTransaction.fulfilled, (state, action) => {
    if (state.loading === 'pending') {
      action.payload.forEach(tx => {
        txAdapter.addOne(state, tx);
      });
      state.loading = 'idle';
      state.error = undefined;
      state.lastTxId = action.payload[0].tx_id;
    }
  });
  builder.addCase(fetchTransaction.rejected, (state, action) => {
    if (state.loading === 'pending') {
      state.loading = 'idle';
      state.error = action.error;
    }
  });
  builder.addCase(HYDRATE, (state, action) => {
    // @ts-ignore
    if (action && action.payload && action.payload.transactions) {
      // @ts-ignore
      // @ts-ignore
      state.loading = 'HYDRATE';
      state.error = undefined;
      state.lastTxId = undefined;
      // @ts-ignore
      const newState = action.payload.transactions;
      console.log('HYDRATE', state, newState);
      // @ts-ignore
      state = newState;
    }
  });
});
