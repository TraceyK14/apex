import React from 'react'
import App from 'next/app'
import Head from 'next/head'
import withApolloClient from '../lib/with-apollo-client'
import { ApolloProvider } from '@apollo/react-hooks'

interface IProps {
  apolloClient: any //fix this
}

class _App extends App<IProps> {
  render() {
    const { Component, pageProps, apolloClient } = this.props

    return (
      <React.Fragment>
        <Head>
          <title>Apex</title>
        </Head>

        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
      </React.Fragment>
    )
  }
}

export default withApolloClient(_App)
