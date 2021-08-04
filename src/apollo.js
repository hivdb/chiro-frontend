import {ApolloClient, InMemoryCache, HttpLink} from '@apollo/client';

let uri = 'http://localhost:5000/graphql';

if (window.__NODE_ENV === 'production') {
  uri = '/graphql';
}

const cache = new InMemoryCache();
const link = new HttpLink({uri});


export default new ApolloClient({
  link,
  cache,
  name: 'chiro-web-client',
  version: '0.1'
});
