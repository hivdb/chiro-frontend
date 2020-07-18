import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';

import {Grid, Header, Item, Loader} from 'semantic-ui-react';

import redirectIfNeeded from '../../utils/redirect-if-needed';
import handleQueryChange from '../../utils/handle-query-change';
import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import setTitle from '../../utils/set-title';

import query from './query.gql.js';
import style from './style.module.scss';
import Smiles from './smiles';


function renderFormula(formula) {
  const result = [];
  let idx = 0;
  for (const n of formula.split(/(\+\d?|\d+)/g)) {
    if (n.startsWith('+')) {
      result.push(<sup key={idx}>{n}</sup>);
    }
    else {
      const d = parseInt(n);
      if (isNaN(d)) {
        result.push(n);
      }
      else {
        result.push(<sub key={idx}>{n}</sub>);
      }
    }
    idx ++;
  }
  return result;
}


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

  handleQueryChange = (actions) => (
    handleQueryChange(actions, this.props)
  )

  render() {
    setTitle('Compounds');
    this.props.loading || redirectIfNeeded(this.props);
    const {
      loading, qCompoundTargetName,
      compoundTarget, compounds
    } = this.props;

    return <Grid stackable className={style['compound-list']}>
      <Grid.Row>
        <Grid.Column width={16}>
          <Header as="h1" dividing>Compounds</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <InlineSearchBox
         onChange={this.handleQueryChange}
         compoundTargetValue={qCompoundTargetName}>
          {({compoundTargetDropdown}) => (
            <StatHeader>
              {[
                {
                  width: 4,
                  className: style['search-box'],
                  cells: [
                    {label: 'Filter by Target', value: compoundTargetDropdown}
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
      </Grid.Row>
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
                  molecularFormula, molecularWeight,
                  category, pubchemCid, relatedCompounds, smiles,
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
                        {molecularFormula ?
                          <span className={style['formula']}>
                            {renderFormula(molecularFormula)}
                          </span> : null}
                        {molecularWeight ?
                          <span className={style['mw']}>
                            {molecularWeight} g/mol
                          </span> : null}
                        {category ?
                          <span className={style['category']}>
                            {category}
                          </span> : null}
                      </Item.Meta>
                      <Item.Description>
                        {description}
                        {pubchemCid ? <>
                          {' '}[<a
                           href={
                             'https://pubchem.ncbi.nlm.nih.' +
                             `gov/compound/${pubchemCid}`
                           }
                           rel="noopener noreferrer"
                           target="_blank">
                            PubChem
                          </a>]
                        </> : null}
                      </Item.Description>
                      <Smiles {...{smiles, name}}>
                        {(trigger, canvas) => <>
                          <Item.Extra>
                            {trigger}
                            {relatedCompounds.length > 0 ? (
                              <span className={style['related-compounds']}>
                                {relatedCompounds
                                 .map(({name}) => name).join(', ')}
                              </span>
                            ) : null}
                            {synonyms.length > 0 ? (
                              <span className={style.synonyms}>
                                {synonyms.join(', ')}
                              </span>
                            ) : null}
                          </Item.Extra>
                          {canvas}
                        </>}
                      </Smiles>
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
