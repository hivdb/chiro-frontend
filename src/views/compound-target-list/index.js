import React from 'react';
import {Link} from 'found';
import sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';

import {Grid, Item, Loader} from 'semantic-ui-react';

import query from './query.gql.js';
import style from './style.module.scss';


class CompoundTargetListInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    compoundTargets: PropTypes.object
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const {
      loading,
      compoundTargets
    } = this.props;

    return <Grid stackable className={style['compound-target-list']}>
      {loading ?
        <Loader active inline="centered" /> :
        <Grid.Row>
          <Grid.Column width={16}>
            <p>
              {compoundTargets.totalCount} compound target
              {compoundTargets.totalCount > 1 ? 's are' : ' is'} listed:
            </p>
            <Item.Group divided>
              {sortBy(compoundTargets.edges, ['ordinal']).map(
                ({node: {
                  name,
                  compoundCount,
                  experimentCounts,
                  relatedCompoundTargets,
                  description
                }}, idx) => (
                  <Item key={idx}>
                    <Item.Content>
                      <Item.Header
                       as={Link}
                       to={{
                         pathname: '/search/',
                         query: {'target': name}
                       }}>
                        {name}
                      </Item.Header>
                      <Item.Extra>
                        <Link to={{
                          pathname: '/search/',
                          query: {'target': name}
                        }}>
                          {experimentCounts.reduce(
                            (acc, {count}) => acc + count, 0
                          )} experiment result(s)
                        </Link>
                        <Link to={{
                          pathname: '/compound-list/',
                          query: {'target': name}
                        }}>
                          {compoundCount} compound result
                          {compoundCount > 1 ? 's' : null}
                        </Link>
                      </Item.Extra>
                      <Item.Description>
                        {description}
                      </Item.Description>
                      <Item.Extra>
                        {relatedCompoundTargets.length > 0 ? (
                          <span className={style['related-compound-targets']}>
                            {relatedCompoundTargets.map(
                              ({name}) => name).join(', ')}
                          </span>
                        ) : null}
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


export default function CompoundTargetList({match, ...props}) {
  let {loading, error, data} = useQuery(query);
  if (loading) {
    return (
      <CompoundTargetListInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <CompoundTargetListInner
     {...props}
     {...data} />
  );
}
