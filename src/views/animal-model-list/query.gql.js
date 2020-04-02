import gql from 'graphql-tag';

export default gql`
  query animalModelList {
    animalModels {
      totalCount
      edges {
        node {
          name
          fullName
          synonyms
          description
          comment
        }
      }
    }
  }
`;
