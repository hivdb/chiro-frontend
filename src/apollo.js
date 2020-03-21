import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';

const cache = new InMemoryCache();
const link = new HttpLink({
    uri: 'http://localhost:5000/graphql',
});


export default new ApolloClient({
  link, cache,
  name: 'chiro-web-client',
  version: '0.1'
})
