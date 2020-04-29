import { configureStore, combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit';
import { MakeStore, createWrapper, Context, HYDRATE } from 'next-redux-wrapper';
import { transactions } from './transactions';

const middleware = getDefaultMiddleware({ thunk: true });

const rootReducer = combineReducers({
  transactions,
});

export type RootState = ReturnType<typeof rootReducer>;

export const initStore = (preloadedState: RootState) => {
  configureStore({
    reducer: rootReducer,
    devTools: true,
    middleware,
  });
};
// store.ts

// create a makeStore function
const makeStore: MakeStore<RootState> = (context: Context) => {
  console.log('Root', rootReducer);
  const store = configureStore({
    reducer: rootReducer,
    devTools: true,
    middleware,
  });

  return store;
};

// export an assembled wrapper
export const wrapper = createWrapper<RootState>(makeStore, { debug: true });
