import React from 'react';
import uniq from 'lodash/uniq';
import PropTypes from 'prop-types';
import {ColumnDef} from 'icosa/components/simple-table';

import {compareIsolateAggs} from '../../hooks/isolate-aggs';
import style from './style.module.scss';


const MAX_DISPLAY_VARIANT_MUTATIONS = 2;


function getDisplay({
  numMutations,
  varNames,
  isoAggkey,
  isolateAggLookup,
  variantLookup
}) {
  const {
    isoAggDisplay,
    varName
  } = isolateAggLookup[isoAggkey] || {};
  let display;
  let mutNotShown = false;

  if (varName) {
    varNames = [varName];
  }

  if (varNames && varNames.length > 0) {
    if (numMutations > 0 && numMutations <= MAX_DISPLAY_VARIANT_MUTATIONS) {
      display = `${varNames.join(' / ')} (${isoAggDisplay})`;
    }
    else if (varNames.length > 1 && !isoAggDisplay) {
      display = `${varNames.join(' / ')} (Wild Type)`;
    }
    else {
      mutNotShown = numMutations > 0;
      display = varNames.map(
        varName => {
          const synonyms = variantLookup[varName]?.synonyms;
          if (synonyms && synonyms.length > 0) {
            return `${varName} (${synonyms[0]})`;
          }
          else {
            return varName;
          }
        }
      ).join(' / ');
    }
  }
  else if (isoAggDisplay) {
    display = isoAggDisplay;
  }
  else {
    mutNotShown = true;
    display = '?';
  }
  return [
    display,
    mutNotShown
  ];
}


CellIsolateAgg.propTypes = {
  numMutations: PropTypes.number,
  varNames: PropTypes.arrayOf(PropTypes.string.isRequired),
  isoAggkey: PropTypes.string,
  isolateAggLookup: PropTypes.object,
  variantLookup: PropTypes.object
};


function exportCellIsolateAgg({
  numMutations,
  varNames,
  isoAggkey,
  isolateAggLookup,
  variantLookup
}) {
  const [isolateDisplay] = getDisplay({
    numMutations,
    varNames,
    isoAggkey,
    isolateAggLookup,
    variantLookup
  });
  return {
    '': isolateDisplay,
    Pos: isoAggkey ? /\d+/.exec(isoAggkey)[0] : '(WT)'
  };
}


function CellIsolateAgg({
  numMutations,
  varNames,
  isoAggkey,
  isolateAggLookup,
  variantLookup
}) {
  const [isolateDisplay, mutNotShown] = React.useMemo(
    () => getDisplay({
      numMutations,
      varNames,
      isoAggkey,
      isolateAggLookup,
      variantLookup
    }),
    [
      isoAggkey,
      isolateAggLookup,
      numMutations,
      varNames,
      variantLookup
    ]
  );
  return <div className={style['isolate-agg']}>
    {isolateDisplay}
    {mutNotShown ?
      <div className={style['mutation-list']}>
        {isolateAggLookup[isoAggkey]?.isoAggDisplay || 'Wild Type'}
      </div> : null}
  </div>;
}


export default function useIsolateAgg({
  labels,
  isolateAggLookup,
  variantLookup,
  skip, columns
}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('isoAggkey')) {
        return null;
      }
      return new ColumnDef({
        name: 'isoAggkey',
        label: labels.isoAggkey || 'Variant',
        render: (isoAggkey, {varName, numMutations}) => (
          <CellIsolateAgg {...{
            isoAggkey,
            numMutations,
            varNames: uniq(varName)
              .filter(v => v !== null)
              .sort(),
            isolateAggLookup,
            variantLookup
          }} />
        ),
        exportCell: (isoAggkey, {varName, numMutations}) => (
          exportCellIsolateAgg({
            isoAggkey,
            numMutations,
            varNames: uniq(varName)
              .filter(v => v !== null)
              .sort(),
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
    [columns, isolateAggLookup, labels.isoAggkey, skip, variantLookup]
  );

}
