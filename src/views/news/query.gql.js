import gql from 'graphql-tag';

export default gql`
  query newsQuery($ts: Int!) {
    news(ts: $ts) {
      publisher
      title
      description
      url
      image
      date
      matches {keyword count}
    }
  }
`;
