import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
} from 'apollo-boost'
import { onError } from 'apollo-link-error'
import fetch from 'isomorphic-unfetch'

let apolloClient = null

// Create the link to the backend
const httpLink = (isBrowser) =>
  new HttpLink({
    uri: process.env.SERVER_URL, // Server URL (must be absolute)
    credentials: 'same-origin', // Additional fetch() options like `credentials` or `headers`
    fetch: !isBrowser && fetch, // Use fetch() polyfill on the server
    connectToDevTools: process.env.NODE_ENV !== 'production',
  })

// Generic Error Handler
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    )
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`)
    // do something with Error
  }
})

// Placeholder for JWT or other Auth Things
const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: localStorage.getItem('token') || null,
    },
  }))
  return forward(operation)
})

function create(initialState) {
  const isBrowser = typeof window !== 'undefined'
  const cache = new InMemoryCache({
    freezeResults: true,
  }).restore(initialState || {})
  const apolloClient = new ApolloClient({
    connectToDevTools: isBrowser,
    ssrMode: !isBrowser, // Disables forceFetch on the server (so queries are only run once)
    link: from([errorLink.concat(httpLink(isBrowser))]),
    cache,
    assumeImmutableResults: true,
    // resolvers: {...resolver}, //Any client side resolvers go here
  })

  return apolloClient
}

export default function initApollo(initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === 'undefined') {
    return create(initialState)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState)
  }

  return apolloClient
}
