import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';

let uri = 'http://localhost:5000/graphql';

if (window.__NODE_ENV === 'production') {
  uri = '/graphql';
}

const cache = new InMemoryCache();
const link = new HttpLink({uri});


export default new ApolloClient({
  link, cache,
  name: 'chiro-web-client',
  version: '0.1'
});
