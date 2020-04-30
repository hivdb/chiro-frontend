import gql from 'graphql-tag';

export default gql`
query {
  compounds {
    edges {
      node {
        name
        target
        articleCount
        status
        clinicalTrialCount
        experimentCounts {
          count
          category
        }
      }
    }
  }
  compoundTargets {
    edges {
      node {
        name
        articleCount
        experimentCounts {
          count
          category
        }
        compoundCount
      }
    }
  }
}
`