import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';

import {Grid, Header, Item, Loader} from 'semantic-ui-react';

import redirectIfNeeded from '../../utils/redirect-if-needed';
import handleQueryChange from '../../utils/handle-query-change';
import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';

import query from './query.gql.js';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';


class CompoundListInner extends React.Component {

  static propTypes = {
    qCompoundTargetName: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    compoundTarget: PropTypes.object,
    compounds: PropTypes.object
  }

  static defaultProps = {
    loading: false
  }

  handleQueryChange = (value, category) => (
    handleQueryChange(value, category, this.props)
  )

  render() {
    setTitle('Compound List');
    this.props.loading || redirectIfNeeded(this.props);
    const {
      loading, qCompoundTargetName,
      compoundTarget, compounds
    } = this.props;

    return <Grid stackable className={style['compound-list']}>
      <Grid.Row>
        <Grid.Column width={16}>
          <Header as="h1" dividing>Compound List</Header>
        </Grid.Column>
      </Grid.Row>
      <InlineSearchBox
       onChange={this.handleQueryChange}
       compoundTargetValue={qCompoundTargetName}>
        {({compoundTargetDropdown}) => (
          <StatHeader>
            {[
              {
                title: 'Selection',
                width: 4,
                cells: [
                  {label: 'Target', value: compoundTargetDropdown}
                ]
              },
              ...(!loading && compoundTarget ? [{
                description: <p>
                  <strong>Target</strong>:{' '}
                  {compoundTarget.description || 'Pending'}
                </p>,
                width: 12
              }] : [])
            ]}
          </StatHeader>
        )}
      </InlineSearchBox>
      {loading ?
        <Loader active inline="centered" /> :
        <Grid.Row>
          <Grid.Column width={16}>
            <p>
              {compounds.totalCount} compound
              {compounds.totalCount > 1 ? 's are' : ' is'} listed:
            </p>
            <Item.Group divided>
              {compounds.edges.map(
                ({node: {
                  name, synonyms, target, drugClassName,
                  molecularWeight, relatedCompounds,
                  experimentCounts, description
                }}, idx) => (
                  <Item key={idx}>
                    <Item.Content>
                      <Item.Header
                       as={Link}
                       to={{
                         pathname: '/search/',
                         query: {'compound': name}
                       }}>
                        {name}
                      </Item.Header>
                      <Item.Extra>
                        <Link to={{
                          pathname: '/search/',
                          query: {'compound': name}
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
                      </Item.Extra>
                      <Item.Meta>
                        <span className={style.target}>{target || '?'}</span>
                        <span className={style['drug-class']}>
                          {drugClassName || '?'}
                        </span>
                        <span className={style['mw']}>
                          {molecularWeight || '?'} g/mol
                        </span>
                      </Item.Meta>
                      <Item.Description>
                        {description}
                      </Item.Description>
                      <Item.Extra>
                        {relatedCompounds.length > 0 ? (
                          <span className={style['related-compounds']}>
                            {relatedCompounds.map(({name}) => name).join(', ')}
                          </span>
                        ) : null}
                        {synonyms.length > 0 ? (
                          <span className={style.synonyms}>
                            {synonyms.join(', ')}
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


export default function CompoundList({match, ...props}) {
  const {
    location: {
      query: {
        target: compoundTargetName
      } = {}
    }
  } = match;
  let {loading, error, data} = useQuery(query, {
    variables: {
      compoundTargetName,
      withCompoundTarget: Boolean(compoundTargetName)
    }
  });
  if (loading) {
    return (
      <CompoundListInner
       loading
       match={match}
       qCompoundTargetName={compoundTargetName} />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <CompoundListInner
     match={match}
     qCompoundTargetName={compoundTargetName}
     {...props}
     {...data} />
  );
}
