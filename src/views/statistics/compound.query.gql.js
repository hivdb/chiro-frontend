import gql from 'graphql-tag';

export default gql`
query compoundSearch(
  $compoundTarget: String!
){
  compounds(completeList: true, compoundTargetName: $compoundTarget) {
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
}
`