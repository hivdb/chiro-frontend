import gql from 'graphql-tag';

export default gql`
query {
  viruses {
    edges {
      node {
        name
        experimentCounts {
          count
          category
        }
      }
    }
  }
}
`;
