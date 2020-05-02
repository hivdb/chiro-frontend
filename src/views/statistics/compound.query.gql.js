import gql from 'graphql-tag';

export default gql`
query compoundSearch(
  $compoundTarget: String!,
  $countIndividualCompound: Boolean!
  $withPendingList: Boolean!
  $completeList: Boolean!
){
  compounds(
    completeList: $completeList,
    withPendingList: $withPendingList,
    compoundTargetName: $compoundTarget) {
    edges {
      node {
        name
        target
        articleCount(countIndividual: $countIndividualCompound)
        status
        clinicalTrialCount
        experimentCounts(countIndividual: $countIndividualCompound) {
          count
          category
        }
      }
    }
  }
}
`;