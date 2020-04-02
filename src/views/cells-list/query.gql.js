import gql from 'graphql-tag';

export default gql`
  query cellsList {
    multipleCells {
      totalCount
      edges {
        node {
          name
          fullName
          synonyms
          relatedCells { name }
          description
        }
      }
    }
  }
`;
