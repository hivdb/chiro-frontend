import React from 'react';
import uniq from 'lodash/uniq';
import PropTypes from 'prop-types';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {compareIsolateAggs} from '../../hooks/isolate-aggs';
import style from './style.module.scss';


const MAX_DISPLAY_VARIANT_MUTATIONS = 2;


function getDisplay({
  numMutations,
  varNames,
  isoAggkeys,
  isolateAggLookup
}) {
  const isoAggDisplay = isoAggkeys
    .map(isoAggkey => isolateAggLookup[isoAggkey]?.isoAggDisplay || '')
    .sort((a, b) => a.length - b.length)[0];
  let display;

  if (varNames && varNames.length > 0) {
    if (numMutations > 0 && numMutations <= MAX_DISPLAY_VARIANT_MUTATIONS) {
      display = `${varNames.join(' / ')} (${isoAggDisplay})`;
    }
    else if (varNames.length > 1 && !isoAggDisplay) {
      display = `Wild Type (${varNames.join(' / ')})`;
    }
    else {
      /* display = varNames.map(
        varName => {
          const synonyms = variantLookup[varName]?.synonyms;
          if (synonyms && synonyms.length > 0) {
            return `${varName} (${synonyms[0]})`;
          }
          else {
            return varName;
          }
        }
      ).join(' / '); */
      display = varNames.join(' / ');
    }
  }
  else if (isoAggDisplay) {
    display = isoAggDisplay;
  }
  else {
    display = '?';
  }
  return display;
}


function exportCellVariantOrIsolateAgg({
  numMutations,
  varNames,
  isoAggkeys,
  isolateAggLookup,
  variantLookup
}) {
  const isolateDisplay = getDisplay({
    numMutations,
    varNames,
    isoAggkeys,
    isolateAggLookup,
    variantLookup
  });
  const ret = {'': isolateDisplay};
  if (isoAggkeys.length > 1) {
    ret.Pos = '(Various)';
    ret.Mutations = '(Various)';
  }
  else if (isoAggkeys[0]) {
    ret.Pos = /\d+/.exec(isoAggkeys[0])[0];
    ret.Mutations = isolateAggLookup[isoAggkeys[0]]?.isoAggDisplay;
  }
  else {
    ret.Pos = '(WT)';
    ret.Mutations = '(WT)';
  }
  return ret;
}


CellVariantOrIsolateAgg.propTypes = {
  numMutations: PropTypes.number,
  varNames: PropTypes.arrayOf(PropTypes.string.isRequired),
  isoAggkeys: PropTypes.arrayOf(PropTypes.string),
  isolateAggLookup: PropTypes.object,
  variantLookup: PropTypes.object
};


function CellVariantOrIsolateAgg({
  numMutations,
  varNames,
  isoAggkeys,
  isolateAggLookup,
  variantLookup
}) {
  const isolateDisplay = React.useMemo(
    () => getDisplay({
      numMutations,
      varNames,
      isoAggkeys,
      isolateAggLookup,
      variantLookup
    }),
    [
      isoAggkeys,
      isolateAggLookup,
      numMutations,
      varNames,
      variantLookup
    ]
  );
  return <div className={style['isolate-agg']}>
    {isolateDisplay}
  </div>;
}


export default function useVariantIsolateAgg({
  labels,
  isolateAggLookup,
  variantLookup,
  skip, columns
}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('varNameOrIsoAggkey')) {
        return null;
      }
      return new ColumnDef({
        name: 'varNameOrIsoAggkey',
        label: labels.varNameOrIsoAggkey || 'Variant',
        render: (_, {varName, isoAggkey, numMutations}) => (
          <CellVariantOrIsolateAgg {...{
            isoAggkeys: uniq(isoAggkey).sort(),
            varNames: uniq(varName).filter(v => v !== null)
              .sort(),
            numMutations: Math.min(numMutations),
            isolateAggLookup,
            variantLookup
          }} />
        ),
        exportCell: (_, {varName, isoAggkey, numMutations}) => (
          exportCellVariantOrIsolateAgg({
            isoAggkeys: uniq(isoAggkey).sort(),
            varNames: uniq(varName).filter(v => v !== null)
              .sort(),
            numMutations: Math.min(numMutations),
            isolateAggLookup,
            variantLookup
          })
        ),
        sort: rows => [...rows].sort(
          (
            {varName: varNamesA, isoAggkey: keyA},
            {varName: varNamesB, isoAggkey: keyB}
          ) => {
            varNamesA = uniq(varNamesA || []).sort();
            varNamesB = uniq(varNamesB || []).sort();
            if (varNamesA < varNamesB) {
              return -1;
            }
            else if (varNamesA > varNamesB) {
              return 1;
            }
            const isoAggA = isolateAggLookup[keyA];
            const isoAggB = isolateAggLookup[keyB];
            return compareIsolateAggs(isoAggA, isoAggB);
          }
        )
      });
    },
    [columns, isolateAggLookup, labels.varNameOrIsoAggkey, skip, variantLookup]
  );

}
