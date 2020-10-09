import gql from 'graphql-tag';

export default gql`
  query articleList {
    articles {
      totalCount
      edges {
        node {
          nickname
          pmid doi pmcid
          title journal
          authors {
            surname
            givenNames
          }
          year
          experimentCounts {
            count
          }
        }
      }
    }
  }
`;
