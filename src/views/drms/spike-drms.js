import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import Markdown from 'icosa/components/markdown';
import SimpleTable, {ColumnDef} from 'icosa/components/simple-table';
import CheckboxInput from 'icosa/components/checkbox-input';
import Loader from 'icosa/components/loader';
import useDRMs from './use-drms';
import useMAbAbbrs from './use-mab-abbrs';
import useIndexedFootnotes from './use-indexed-footnotes';
import MutationCell from './mutation-cell';
import MAbCell from './mab-cell';
import IntegerCell from './integer-cell';
import PrevalenceCell from './prevalence-cell';
import FootnotesCell from './footnotes-cell';
import References from './references';
import style from './style.module.scss';


const REF_COL_TYPE_ORDER = [
  'FOLD', 'DMS', 'POCKET', 'FITNESS', 'INVIVO', 'INVITRO'
];

SpikeDRMs.propTypes = {
  drdbVersion: PropTypes.string.isRequired,
  contentBefore: PropTypes.string,
  contentAfter: PropTypes.string,
  displayMAbs: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
};

export default function SpikeDRMs({
  drdbVersion,
  contentBefore,
  contentAfter,
  displayMAbs
}) {
  const [displayAll, toggleDisplayAll] = React.useReducer(f => !f, false);
  const [displayFn, toggleDisplayFn] = React.useReducer(f => !f, false);
  const params = {
    drdbVersion,
    gene: 'S',
    minPrevalence: displayAll ? 0 : 0.000001
  };
  const [drms, isDRMsPending] = useDRMs(params);
  const cacheKey = JSON.stringify(params);
  const [mabLookup, isMAbPending] = useMAbAbbrs(params);
  const isPending = isDRMsPending || isMAbPending;
  const refNames = useIndexedFootnotes(drms, REF_COL_TYPE_ORDER);

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
          render: (val, {aminoAcid: aa}) => (
            <PrevalenceCell
             indel={aa === 'ins' || aa === 'del'}
             value={val} />
          )
        }),
        ...(displayFn ? [
          new ColumnDef({
            name: 'footnotes',
            label: 'Footnote',
            render: footnotes => (
              <FootnotesCell
               footnotes={footnotes}
               orderedColTypes={REF_COL_TYPE_ORDER}
               refNames={refNames} />
            )
          })
        ] : [])
      ]);
      return colDefs;
    },
    [isPending, displayMAbs, mabLookup, refNames, displayFn]
  );

  return <>
    {isPending ? <Loader /> : <>
      {contentBefore ? <Markdown escapeHtml={false}>
        {contentBefore}
      </Markdown> : null}
      <p className={style['display-desc']}>
        Following lists {drms.length.toLocaleString('en-US')} Spike mAb
        resistance mutations. Resistance mutations with global prevalence ≤
        1/1,000,000 are{displayAll ? ' shown.' : ' not shown.'}
        <CheckboxInput
         id="display-all"
         name="display-all"
         className={style['display-all-checkbox']}
         onChange={toggleDisplayAll}
         checked={displayAll}>
          Click here to {displayAll ? 'hide' : 'display'} DRMs with global
          prevalence ≤ 1/1,000,000.
        </CheckboxInput>
        <CheckboxInput
         id="display-fn"
         name="display-fn"
         className={style['display-fn-checkbox']}
         onChange={toggleDisplayFn}
         checked={displayFn}>
          Click here to {displayFn ? 'hide' : 'display'} reference footnotes.
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
      {contentAfter ? <Markdown escapeHtml={false}>
        {contentAfter}
      </Markdown> : null}
      <References refNames={refNames} />
    </>}
  </>;
}
