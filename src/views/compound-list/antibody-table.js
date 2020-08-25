import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import {Header} from 'semantic-ui-react';

import ChiroTable, {ColumnDef} from '../../components/chiro-table';

import style from './style.module.scss';


const orderedViruses = [
  'SARS-CoV-2', 'SARS-CoV', 'MERS-CoV'
];


const columnDefs = [
  new ColumnDef({name: 'name'}),
  /*new ColumnDef({
    name: 'synonyms',
    render: synonyms => ', '.join(synonyms),
    sortable: false
  }),
  new ColumnDef({
    name: 'antibodyData.targetVirusName',
    label: 'target'
  }),*/
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
    </>
  }),
  new ColumnDef({
    name: 'drugClassName',
    label: 'Ab type',
    render: abtype => ({
      'Monoclonal antibody': 'MAb',
      'Single-domain Ab': 'sdAb',
      'Single-domain Ab-Fc': 'sdAb-Fc',
      'Single-domain Ab(2)-Fc': 'sdAb(2)-Fc',
      'Single-domain Ab-trivalent': 'sdAb-trivalent',
      'Single-chain variable fragment': 'scFv'
    }[abtype] || abtype)
  }),
  new ColumnDef({
    name: 'antibodyData.source', label: 'Source'
  }),
  new ColumnDef({
    name: 'antibodyData.abdabAvailability',
    label: (
      <a
       target="_blank" rel="noopener noreferrer"
       href="http://opig.stats.ox.ac.uk/webapps/covabdab/">
        CoV-AbDab?
      </a>
    ),
    render: abdab => abdab ? 'Yes' : ''
  }),
  new ColumnDef({
    name: 'antibodyData.pdb',
    label: 'PDB'
  }),
  new ColumnDef({
    name: 'antibodyData.epitope',
    label: 'Epitope'
  }),
  new ColumnDef({
    name: 'antibodyData.animalModel',
    label: 'Animal model'
  }),
  new ColumnDef({
    name: 'description'
  }),
  new ColumnDef({
    name: 'name',
    label: 'Experiments',
    render: name => (
      <Link to={{
        pathname: '/search/',
        query: {'compound': name}
      }}>
        Result link
      </Link>
    )
  }),
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
         data={compoundsByTargetVirus[virus] || []} />
      </section>)}
    </>;
  }

}
