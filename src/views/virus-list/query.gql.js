import gql from 'graphql-tag';

export default gql`
  query virusList {
    viruses {
      totalCount
      edges {
        node {
          name
          fullName
          synonyms
          typeName
          relatedViruses {
            name
          }
          experimentCounts {
            count
          }
          description
          ordinal
        }
      }
    }
  }
`;
