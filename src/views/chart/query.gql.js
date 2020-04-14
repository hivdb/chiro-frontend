import gql from 'graphql-tag';

export default gql`
  query chartResult(
    $compoundTargetName: String
  ) {
    virusExperiments: virusInCellCultureExperiments(
      compoundTargetName: $compoundTargetName,
    ) {
      totalCount
      edges {
        node {
          categoryName
          virusName
          compoundNames
          ec50cmp
          ec50
          ec50unit
          ec50inactive
        }
      }
    }
  }
`