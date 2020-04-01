import gql from 'graphql-tag';

export default gql`
  query targetList {
    compoundTargets {
      totalCount
      edges {
        node {
          name
          relatedCompoundTargets {
            name
          }
          experimentCounts {
            count
          }
          compoundCount
          description
          ordinal
        }
      }
    }
  }
`;
