import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import SimpleTable, {ColumnDef} from 'icosa/components/simple-table';
import Loader from 'icosa/components/loader';
import useDRMs from './use-drms';
import useDrugAbbrs from './use-drug-abbrs';
import DrugCell from './drug-cell';
import IntegerCell from './integer-cell';
import PrevalenceCell from './prevalence-cell';
import style from './style.module.scss';


RdRPDRMs.propTypes = {
  drdbVersion: PropTypes.string.isRequired,
  displayDrugs: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
};

export default function RdRPDRMs({drdbVersion, displayDrugs}) {
  const params = {
    drdbVersion,
    gene: 'RdRP'
  };
  const [drms, isDRMsPending] = useDRMs(params);
  const cacheKey = JSON.stringify(params);
  const [DrugLookup, isDrugPending] = useDrugAbbrs(params);
  const isPending = isDRMsPending || isDrugPending;

  const colDefs = React.useMemo(
    () => {
      if (isPending) {
        return [];
      }
      const colDefs = [
        new ColumnDef({
          name: 'text',
          label: 'Mutation',
          sort: rows => sortBy(rows, ['position', 'aminoAcid'])
        })
      ];
      for (const Drug of displayDrugs) {
        colDefs.push(
          new ColumnDef({
            name: `Drug:${Drug}`,
            label: DrugLookup[Drug],
            render: (_, row) => (
              <DrugCell
               fold={row[`FOLD:${Drug}`]}
               pocket={row[`POCKET:${Drug}`]} />
            ),
            sort: rows => sortBy(rows, [`FOLD:${Drug}`, `POCKET:${Drug}`])
          })
        );
      }
      colDefs.push(...[
        new ColumnDef({
          name: 'INVIVO',
          label: 'in patient',
          render: val => <IntegerCell value={val} />
        }),
        new ColumnDef({
          name: 'INVITRO',
          label: 'in vitro',
          render: val => <IntegerCell value={val} />
        }),
        new ColumnDef({
          name: 'PREVALENCE',
          label: 'Prevalence',
          render: val => <PrevalenceCell value={val} />
        })
      ]);
      return colDefs;
    },
    [isPending, displayDrugs, DrugLookup]
  );

  return <>
    {isPending ? <Loader /> :
    <SimpleTable
     key={cacheKey}
     cacheKey={cacheKey}
     windowScroll
     noHeaderOverlapping
     compact
     lastCompact
     className={style['drms-table']}
     columnDefs={colDefs}
     data={drms} />}
  </>;
}
