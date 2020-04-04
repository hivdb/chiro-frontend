import React from 'react';
import ReactMarkdown from 'react-markdown';
import {Message, Loader} from 'semantic-ui-react';
import {useQuery} from '@apollo/react-hooks';
import query from './abstract.gql';

function AbstractMessage(nickname) {
  let {loading, error, data} = useQuery(query, {
    variables: {
      articleNickname: nickname['nickname']
    }
  });

  if (loading) {
    return <Loader active inline="centered" />;
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <p>
      <ReactMarkdown source={data.article.abstract} escapeHtml={false}/>
    </p>
  );
}


export default class ArticleAbstractInfo extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      hideAbstract: true
    };
    this.handleHide = this.handleHide.bind(this);
  }

  handleHide(e) {
    e.preventDefault();
    this.setState({
      hideAbstract: !this.state.hideAbstract,
    });
  }

  render() {
    const {nickname} = this.props;
    return (
      <>
        {' '}
        <a href="#abstract"
         style={{'font-weight': 'bold'}}
         onClick={this.handleHide}>
          view abstract
        </a>
        {' '}
        <Message hidden={this.state.hideAbstract}>
          {this.state.hideAbstract ?
            '' : <AbstractMessage nickname={nickname}/>
          }
        </Message>
      </>
    );
  }
}
