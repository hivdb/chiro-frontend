import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import Markdown from 'icosa/components/markdown';
import SimpleTable, {ColumnDef} from 'icosa/components/simple-table';
import Loader from 'icosa/components/loader';
import useDRMs from './use-drms';
import useDrugAbbrs from './use-drug-abbrs';
import MutationCell from './mutation-cell';
import DrugCell from './drug-cell';
import IntegerCell from './integer-cell';
import PrevalenceCell from './prevalence-cell';
import style from './style.module.scss';


RdRPDRMs.propTypes = {
  drdbVersion: PropTypes.string.isRequired,
  contentBefore: PropTypes.string,
  displayDrugs: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
};

export default function RdRPDRMs({drdbVersion, displayDrugs, contentBefore}) {
  const params = {
    drdbVersion,
    gene: 'RdRP'
  };
  const [drms, isDRMsPending] = useDRMs(params);
  const cacheKey = JSON.stringify(params);
  const [drugLookup, isDrugPending] = useDrugAbbrs(params);
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
          render: (text, row) => (
            <MutationCell text={text} varcons={row.VARCONS} />
          ),
          sort: rows => sortBy(rows, ['position', 'aminoAcid'])
        })
      ];
      for (const drug of displayDrugs) {
        colDefs.push(
          new ColumnDef({
            name: `drug:${drug}`,
            label: drugLookup[drug],
            render: (_, row) => (
              <DrugCell
               fold={row[`FOLD:${drug}`]}
               pocket={row[`POCKET:${drug}`]} />
            ),
            exportCell: (_, row) => ({
              fold: row[`FOLD:${drug}`],
              pocket: row[`POCKET:${drug}`]
            }),
            sort: rows => sortBy(rows, [`FOLD:${drug}`, `POCKET:${drug}`])
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
        })
      ]);
      return colDefs;
    },
    [isPending, displayDrugs, drugLookup]
  );

  return <>
    {isPending ? <Loader /> : <>
      {contentBefore ? <Markdown escapeHtml={false}>
        {contentBefore}
      </Markdown> : null}
      <p className={style['display-desc']}>
        Following lists {drms.length.toLocaleString('en-US')} RdRP inhibitor
        resistance mutations.
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
