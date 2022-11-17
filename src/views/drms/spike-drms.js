import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import Markdown from 'icosa/components/markdown';
import SimpleTable, {ColumnDef} from 'icosa/components/simple-table';
import CheckboxInput from 'icosa/components/checkbox-input';
import Loader from 'icosa/components/loader';
import useDRMs from './use-drms';
import useMAbAbbrs from './use-mab-abbrs';
import MutationCell from './mutation-cell';
import MAbCell from './mab-cell';
import IntegerCell from './integer-cell';
import PrevalenceCell from './prevalence-cell';
import style from './style.module.scss';


SpikeDRMs.propTypes = {
  drdbVersion: PropTypes.string.isRequired,
  contentBefore: PropTypes.string,
  displayMAbs: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
};

export default function SpikeDRMs({drdbVersion, contentBefore, displayMAbs}) {
  const [displayAll, toggleDisplayAll] = React.useReducer(f => !f, false);
  const params = {
    drdbVersion,
    gene: 'S',
    minPrevalence: displayAll ? 0 : 0.000001
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
          render: (text, row) => (
            <MutationCell text={text} varcons={row.VARCONS} />
          ),
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
            exportCell: (_, row) => ({
              fold: row[`FOLD:${mab}`],
              dms: row[`DMS:${mab}`]
            }),
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
    {isPending ? <Loader /> : <>
      {contentBefore ? <Markdown escapeHtml={false}>
        {contentBefore}
      </Markdown> : null}
      <p className={style['display-desc']}>
        Following lists {drms.length.toLocaleString('en-US')} Spike mAb
        resistance mutations. Resistance mutations with global prevalence ≤
        0.0001% are{displayAll ? ' shown.' : ' not shown.'}
        <CheckboxInput
         id="display-all"
         name="display-all"
         className={style['display-all-checkbox']}
         onChange={toggleDisplayAll}
         checked={displayAll}>
          Click here to {displayAll ? 'hide' : 'display'} them all.
        </CheckboxInput>
      </p>
      <SimpleTable
       key={cacheKey}
       cacheKey={cacheKey}
       windowScroll
       noHeaderOverlapping
       compact
       lastCompact
       className={style['drms-table']}
       columnDefs={colDefs}
       data={drms} />
    </>}
  </>;
}
