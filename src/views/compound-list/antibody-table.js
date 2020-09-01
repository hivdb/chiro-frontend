import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import {Header} from 'semantic-ui-react';

import ChiroTable, {ColumnDef} from '../../components/chiro-table';
import TrialLink from '../../components/clinical-trial-link';

import style from './style.module.scss';


const orderedViruses = [
  'SARS-CoV-2', 'SARS-CoV', 'MERS-CoV'
];


const columnDefs = [
  new ColumnDef({
    name: 'articles',
    label: 'Refs',
    render: articles => <>
      {articles.map(({nickname, doi}) => (
        <a
         className={style['article-link']}
         href={`https://doi.org/${doi[0]}`}
         rel="noopener noreferrer"
         target="_blank">
          {nickname[0]}
        </a>
      ))}
    </>,
    sort: data => sortBy(data, ['articles[0].nickname'])
  }),
  new ColumnDef({
    name: 'name',
    label: 'Ab name',
  }),
  new ColumnDef({
    name: 'drugClassName',
    label: 'Ab type',
  }),
  new ColumnDef({
    name: 'antibodyData.source', label: 'Ab source'
  }),
  new ColumnDef({
    name: 'antibodyData.abdabAvailability',
    label: <>
      Sequence<br />(
      <a
       target="_blank" rel="noopener noreferrer"
       href="http://opig.stats.ox.ac.uk/webapps/covabdab/">
        CoV-AbDab
      </a>)
    </>,
    render: abdab => abdab ? 'Yes' : '',
    none: '-'
  }),
  new ColumnDef({
    name: 'hasExperiments',
    label: 'EC50',
    render: (hasExps, {name, target}) => hasExps ?
      <Link to={{
        pathname: '/search/',
        query: {
          target,
          compound: name,
          no_related_compounds: 'yes'
        }
      }}>
        results
      </Link> : '-'
  }),
  new ColumnDef({
    name: 'antibodyData.pdb',
    label: <>Structure<br />(PDB)</>,
    none: '-'
  }),
  new ColumnDef({
    name: 'antibodyData.animalModel',
    label: 'Animal model',
    none: '-'
  }),
  new ColumnDef({
    name: 'clinicalTrialObjs',
    label: 'Clinical trials',
    render: (trials, {name, target}) => <>
      {trials.length > 0 ? <>
        {trials.map(
          ({trialNumbers}) => trialNumbers.map(tn => (
            <div key={tn} className={style['trial-number']}>
              <TrialLink number={tn} />
            </div>
          ))
        )}
        (<Link to={{
          pathname: '/clinical-trials/',
          query: {
            target,
            compound: name,
            no_related_compounds: 'yes'
          }
        }}>results</Link>)
      </> : '-'}
    </>
  })
];



export default class AntibodyTable extends React.Component {

  static propTypes = {
    compounds: PropTypes.array.isRequired
  }

  render() {
    const {compounds} = this.props;
    const compoundsByTargetVirus = groupBy(
      compounds, 'antibodyData.targetVirusName');
    return <>
      {orderedViruses.map(virus => <section className={style['ab-table']}>
        <Header as="h2" dividing>
          {virus}
        </Header>
        <ChiroTable
         cacheKey="antibody"
         columnDefs={columnDefs}
         data={sortBy(compoundsByTargetVirus[virus], [
           data => data.clinicalTrialObjs.length === 0,
           '-hasExperiments',
           'articles[0].nickname',
           'name'
         ]) || []} />
      </section>)}
    </>;
  }

}
