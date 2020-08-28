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
          expArticleCount
          experimentCounts {
            count
            category
          }
          compoundCount
          description
          ordinal
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
