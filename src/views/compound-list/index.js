import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';

import {Grid, Header, Item, Loader} from 'semantic-ui-react';

import isTargetMAb from '../../utils/is-target-mab';
import redirectIfNeeded from '../../utils/redirect-if-needed';
import handleQueryChange from '../../utils/handle-query-change';
import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import setTitle from '../../utils/set-title';
import PromiseComponent from '../../utils/promise-component';
import {loadPage} from '../../utils/cms';

import query from './query.gql.js';
import style from './style.module.scss';
import Smiles from './smiles';
import AntibodyTable from './antibody-table';


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

  thenRender = ({
    content
  } = {}) => {
    setTitle('Compounds');
    this.props.loading || redirectIfNeeded(this.props);
    const {
      loading, qCompoundTargetName,
      compoundTarget, compounds
    } = this.props;

    let inner;
    if (!loading) {
      if (isTargetMAb(qCompoundTargetName)) {
        inner = <AntibodyTable compounds={
          compounds.edges.map(({node}) => node)} />;
      }
      else {
        const notMabCompounds = compounds.edges.filter(({node}) => {
          return !isTargetMAb(node.target);
        });
        inner = (
          <Grid.Row>
            <Grid.Column width={16}>
              <p>
                {notMabCompounds.length} compound
                {notMabCompounds.length > 1 ? 's are' : ' is'} listed:
              </p>
              <Item.Group divided>
                {notMabCompounds.map(
                  ({node: {
                    name, synonyms, target, drugClassName,
                    molecularFormula, molecularWeight,
                    category, pubchemCid, casNumber, relatedCompounds, smiles,
                    experimentCounts = [], description
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
                          {casNumber ? (
                            <span className={style['cas-number']}>
                              {casNumber}
                            </span>
                          ) : null}
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
                            {' ['}<a
                             className={style['pubchem-cid']}
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
        );
      }
    }

    return <Grid stackable className={style['compound-list']}>
      <Grid.Row>
        <Grid.Column width={16}>
          <Header as="h1" dividing>Compounds</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <div className={style['compound-list-desc']}>
          {content}
        </div>
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
      {loading ? <Loader active inline="centered" /> : inner}
    </Grid>;

  }

  render() {
    return (
      <PromiseComponent
       promise={loadPage('compound-list')}
       then={this.thenRender} />
    );
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
  const isMAb = isTargetMAb(compoundTargetName);
  let {loading, error, data} = useQuery(query, {
    variables: {
      compoundTargetName,
      withCompoundTarget: Boolean(compoundTargetName),
      isTargetMAb: isMAb,
      isNotTargetMAb: !isMAb
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
