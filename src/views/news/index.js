import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';

import {Grid, Header, Item, Loader} from 'semantic-ui-react';

import query from './query.gql.js';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';


function removeCoVKeywords({keyword}) {
  return !(/coronavirus|covid|^19$|sars|^2$/.test(keyword));
}


class NewsInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    news: PropTypes.object
  };

  static defaultProps = {
    loading: false
  };

  render() {
    let {
      loading,
      news
    } = this.props;
    setTitle('Coronavirus News');

    return <Grid stackable className={style['news']}>
      {loading ?
        <Loader active inline="centered" /> :
        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h1" dividing>
              <Header.Content>
                Coronavirus Treatment News
              </Header.Content>
            </Header>
            <Item.Group divided>
              {news.map(
                ({
                  publisher,
                  title,
                  description,
                  url,
                  image,
                  date,
                  matches
                }, idx) => (
                  <Item key={idx}>
                    {image ?
                      <Item.Image size="small" src={image} /> : null}
                    <Item.Content>
                      <Item.Header
                       as="a"
                       rel="noopener noreferrer"
                       target="_blank"
                       href={url}>
                        {title}
                      </Item.Header>
                      <Item.Meta>
                        {publisher}{' '}&bull;{' '}
                        {date ? moment(date).fromNow() : null}
                      </Item.Meta>
                      <Item.Description>
                        {description} (
                        <a
                         rel="noopener noreferrer"
                         href={url}
                         target="_blank">Read more
                        </a>
                        )
                      </Item.Description>
                      <Item.Extra>
                        <span className={style['keywords']}>
                          {matches
                            .filter(removeCoVKeywords)
                            .map(({keyword}) => keyword)
                            .join(', ')
                          }
                        </span>
                      </Item.Extra>
                    </Item.Content>
                  </Item>
                )
              )}
            </Item.Group>
          </Grid.Column>
        </Grid.Row>
      }
    </Grid>;

  }


}


export default function News(props) {
  const now = new Date();
  const ts = Math.ceil(now.getTime() / 3600000) * 3600;
  let {loading, error, data} = useQuery(query, {variables: {ts}});
  if (loading) {
    return (
      <NewsInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <NewsInner
     {...props}
     news={data.news} />
  );
}
