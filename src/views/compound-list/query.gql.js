import gql from 'graphql-tag';

export default gql`
  query compoundList(
    $compoundTargetName: String
    $withCompoundTarget: Boolean!
  ) {
    compoundTarget(name: $compoundTargetName)
    @include(if: $withCompoundTarget) {
      name
      description
    }
    compounds(
      compoundTargetName: $compoundTargetName
      completeList: true
    ) {
      totalCount
      edges {
        node {
          name
          synonyms
          target
          drugClassName
          molecularFormula
          molecularWeight
          smiles
          pubchemCid
          relatedCompounds {
            name
          }
          experimentCounts {
            count
          }
          description
        }
      }
    }
  }
`;
