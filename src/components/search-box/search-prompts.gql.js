import gql from 'graphql-tag';

export default gql`
  query SearchPrompts {
    compounds {
      totalCount
      edges {
        node {
          name
          synonyms
          drugClassName
          description
          relatedCompounds {
            name
            synonyms
          }
        }
      }
    }
    viruses {
      totalCount
      edges {
        node {
          name
          fullName
          synonyms
          typeName
          description
        }
      }
    }
  }
`;
