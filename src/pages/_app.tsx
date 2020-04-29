import React from 'react';
import App, { AppContext, AppProps } from 'next/app';
import withRedux from 'next-redux-wrapper';
import { ThemeProvider, CSSReset, theme } from '@blockstack/ui';
import { Provider } from 'react-redux';
import { createGlobalStyle } from 'styled-components';
import { RootState, wrapper } from '@store';
import { handleFontLoading } from '@common/fonts';
import '@common/clarity-language-definition';
import { ColorModes } from '@components/color-modes';
import { ReduxNextPageContext } from '@common/types';

const GlobalStyles = createGlobalStyle`
  html, body, #__next {
    height: 100%;
  }
  .prism-code *::selection{
    background-color: #AAB3FF;
    color: white !important;
  }
`;

// @ts-ignore
const MyApp = wrapper.withRedux(({ Component, pageProps, store, ctx, ...rest }) => {
  // async componentDidMount() {
  //   await handleFontLoading();
  // }

  return (
    <ThemeProvider theme={theme}>
      <>
        <CSSReset />
        <ColorModes />
        <GlobalStyles />
        <Component {...pageProps} />
      </>
    </ThemeProvider>
  );
});

export default MyApp;
