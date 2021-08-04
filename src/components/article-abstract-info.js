import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import {Message, Loader} from 'semantic-ui-react';
import {useQuery} from '@apollo/client';
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
    <ReactMarkdown source={data.article.abstract} escapeHtml={false}/>
  );
}


export default function ArticleAbstractInfo({nickname}) {

  const [hideAbstract, setHideAbstract] = React.useState(true);

  const handleHide = React.useCallback(
    e => {
      e.preventDefault();
      setHideAbstract(!hideAbstract);
    },
    [hideAbstract, setHideAbstract]
  );

  return (
    <>
      {' '}
      <a
       href="#abstract"
       style={{fontWeight: 'bold'}}
       onClick={handleHide}>
        view abstract
      </a>
      {' '}
      <Message hidden={hideAbstract}>
        {hideAbstract ?
          '' : <AbstractMessage nickname={nickname}/>
        }
      </Message>
    </>
  );
  
}

ArticleAbstractInfo.propTypes = {
  nickname: PropTypes.string.isRequired
};
