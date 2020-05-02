import gql from 'graphql-tag';

export default gql`
query {
  compoundTargets {
    edges {
      node {
        name
        articleCount
        experimentCounts(countIndividual: true) {
          count
          category
        }
        compoundCount
        compoundObjs {
          totalCount
          edges {
            node {
              name
              status
            }
          }
        }
      }
    }
  }
}
`;