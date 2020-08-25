import React from 'react';
import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';

import ChiroTable from '../../components/chiro-table';
import {clinicalExperimentsShape} from './prop-types';

import {
  ColDef, reformExpData,
  authorYearColDef, virusSpeciesDef,
} from './table-helper';


function attachedTextColDef(type) {
  return new ColDef({
    name: type,
    label: type,
    render: (_, {attachedTextObjs}) => {
      for (const one of attachedTextObjs) {
        if (one.type === type) {
          return one.content;
        }
      }
    },
    sortable: false,
    textAlign: 'justify'
  });
}


const tableColumns = [
  authorYearColDef, virusSpeciesDef,
  new ColDef({name: 'regimenDetail', label: 'Regimen'}),
  new ColDef({name: 'studyTypeName', label: 'Study Type'}),
  new ColDef({name: 'numSubjects', label: '#'}),
  attachedTextColDef('Population description'),
  attachedTextColDef('Findings'),
  new ColDef({
    name: 'publishDate',
    label: 'Publish Date',
    render: (year, {articles}) => {
      const publishDate = articles.length > 0? articles[0].publishDate: null;
      if (publishDate) {
        return publishDate.slice(0, 10);
      } else {
        return '';
      }
    },
    sort: (data) => {
      return data.sort(({articles:articles1}, {articles:articles2}) => {
        const publishDate1 =
          articles1.length > 0 ? articles1[0].publishDate: null;
        const publishDate2 =
          articles1.length > 0 ? articles2[0].publishDate: null;

        if (!publishDate1) {
          return -1;
        } else if (!publishDate2) {
          return 1;
        } else {
          return (
            new Date(publishDate1) - new Date(publishDate2)
          );
        }
      });
    }
  })
];


export default class ClinicalExpTable extends React.Component {

  static propTypes = {
    cacheKey: PropTypes.string.isRequired,
    data: clinicalExperimentsShape.isRequired
  }

  render() {
    const {cacheKey, data} = this.props;
    return (
      <ChiroTable
       cacheKey={cacheKey}
       columnDefs={tableColumns}
       data={reformExpData(data, data => orderBy(
         data, [r => r.studyTypeOrdinal, r => r.numSubjects],
         ['asc', 'desc']
       ))} />
    );
  }

}
