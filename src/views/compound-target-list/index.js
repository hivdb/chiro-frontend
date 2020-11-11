import React from 'react';
import {Link} from 'found';
import sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';

import {Grid, Header, Item, Loader} from 'semantic-ui-react';

import query from './query.gql.js';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';
import TargetTable from '../statistics/target';
import CompoundTable from '../statistics/compound';
import BackToTop from '../../components/back-to-top';


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

    setTitle('Drug Targets');

    return <Grid stackable className={style['compound-target-list']}>
      {loading ?
        <Loader active inline="centered" /> :
        <Grid.Row>
          <Grid.Column width={16} className={style['content-container']}>
            <Header as="h1" dividing>Drug Targets</Header>
            <p>
              {compoundTargets.totalCount} compound target
              {compoundTargets.totalCount > 1 ? 's are' : ' is'} listed:
            </p>
            <TargetTable
             data={compoundTargets}
             changeTarget={x => x} />
            <Item.Group divided>
              {sortBy(compoundTargets.edges, ['ordinal']).map(
                ({node: {
                  name,
                  compoundCount,
                  experimentCounts,
                  relatedCompoundTargets,
                  description
                }}, idx) => (
                  <Item key={idx} id={name}>
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
                          {(() => {
                            const total = experimentCounts.reduce(
                              (acc, {count}) => acc + count, 0
                            );
                            if (total > 1) {
                              return `${total} experiment results`;
                            }
                            else {
                               return `${total} experiment result`;
                            }
                          })()}
                        </Link>
                        <Link to={{
                          pathname: '/compound-list/',
                          query: {'target': name}
                        }}>
                          {compoundCount} compound result
                          {compoundCount > 1 ? 's' : null}
                        </Link>
                      </Item.Extra>
                      <Item.Description className={style['compound-desc']}>
                        {description}
                      </Item.Description>
                      <Item.Extra>
                        <CompoundTable selectedTarget={name}/>
                      </Item.Extra>
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
            <BackToTop />
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
