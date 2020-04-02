import gql from 'graphql-tag';

export default gql`
  query newsQuery($ts: Int!) {
    news(ts: $ts) {
      status
      code
      message
      articles {
        source { name }
        title
        description
        url
        urlToImage
        publishedAt
      }
    }
  }
`;
