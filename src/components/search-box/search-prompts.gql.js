import gql from 'graphql-tag';

export default gql`
  query SearchPrompts {
    compoundTargets {
      edges {
        node {
          name
          synonyms
          relatedCompoundTargets {
            name
            synonyms
          }
        }
      }
    }
    compounds {
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
