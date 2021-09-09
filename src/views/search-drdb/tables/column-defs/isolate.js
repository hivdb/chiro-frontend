import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import shortenMutList from '../../shorten-mutlist';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {formatPotency} from './potency';
import style from './style.module.scss';


function useIsolateDisplay({isoName, isolateLookup}) {
  if (!(isoName in isolateLookup)) {
    return '?';
  }
  const {
    varName,
    synonyms,
    mutations,
    numMuts,
    expandable
  } = isolateLookup[isoName];
  const displayVarName = (
    synonyms.length > 0 ?
      `${varName} (${synonyms[0]})` : varName
  );
  const shortenMuts = shortenMutList(mutations);

  if (varName) {
    if (numMuts === 1) {
      return `${varName} (${shortenMuts.join(' + ')})`;
    }
    else {
      return displayVarName;
    }
  }
  else {
    const shortenMuts = shortenMutList(mutations);
    if (expandable && shortenMuts.length > 0) {
      return <>
        {shortenMuts.join(' + ')}
      </>;
    }
    else {
      // not expandable or no mutations; fallback to varName
      return displayVarName;
    }
  }
}


function CellIsolate({
  isoName,
  potency,
  potencyUnit,
  potencyType,
  enablePotency,
  ineffective,
  isolateLookup
}) {
  const isolateDisplay = useIsolateDisplay({isoName, isolateLookup});
  if (enablePotency && potency !== null && potency !== undefined) {
    return <>
      {isolateDisplay}
      <div className={classNames(style['supplement-info'], style['small'])}>
        {potencyType}{': '}
        {formatPotency({
          potency,
          potencyType,
          ineffective,
          potencyUnit,
          forceShowUnit: true
        })}
      </div>
    </>;
  }
  else {
    return isolateDisplay;
  }
}

CellIsolate.propTypes = {
  isoName: PropTypes.string,
  potency: PropTypes.number,
  potencyUnit: PropTypes.string,
  potencyType: PropTypes.string,
  enablePotency: PropTypes.bool,
  ineffective: PropTypes.bool,
  isolateLookup: PropTypes.object
};


export function useInfectedIsoName({
  labels,
  columns,
  isolateLookup,
  compareByInfectedIsolate,
  skip
}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('infectedIsoName')) {
        return null;
      }
      return new ColumnDef({
        name: 'infectedIsoName',
        label: labels.infectedIsoName || 'Infection (CP)',
        render: isoName => (
          <CellIsolate {...{isoName, isolateLookup}} />
        ),
        sort: rows => [...rows].sort(compareByInfectedIsolate)
      });
    },
    [
      columns,
      compareByInfectedIsolate,
      isolateLookup,
      labels.infectedIsoName,
      skip
    ]
  );
}
