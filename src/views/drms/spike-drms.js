import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import SimpleTable, {ColumnDef} from 'icosa/components/simple-table';
import Loader from 'icosa/components/loader';
import useDRMs from './use-drms';
import useMAbAbbrs from './use-mab-abbrs';
import MAbCell from './mab-cell';
import IntegerCell from './integer-cell';
import PrevalenceCell from './prevalence-cell';
import style from './style.module.scss';


SpikeDRMs.propTypes = {
  drdbVersion: PropTypes.string.isRequired,
  displayMAbs: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
};

export default function SpikeDRMs({drdbVersion, displayMAbs}) {
  const params = {
    drdbVersion,
    gene: 'S'
  };
  const [drms, isDRMsPending] = useDRMs(params);
  const cacheKey = JSON.stringify(params);
  const [mabLookup, isMAbPending] = useMAbAbbrs(params);
  const isPending = isDRMsPending || isMAbPending;

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
      for (const mab of displayMAbs) {
        colDefs.push(
          new ColumnDef({
            name: `MAb:${mab}`,
            label: mabLookup[mab],
            render: (_, row) => (
              <MAbCell
               fold={row[`FOLD:${mab}`]}
               dms={row[`DMS:${mab}`]} />
            ),
            sort: rows => sortBy(rows, [`FOLD:${mab}`, `DMS:${mab}`])
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
    [isPending, displayMAbs, mabLookup]
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
