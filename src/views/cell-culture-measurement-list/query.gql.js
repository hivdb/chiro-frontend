import gql from 'graphql-tag';

export default gql`
  query cellCultureMeasurementList {
    cellCultureMeasurements {
      totalCount
      edges {
        node {
          name
          fullName
          synonyms
          description
        }
      }
    }
  }
`;
