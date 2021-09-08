import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {formatPotency} from './cell-potency';
import style from '../style.module.scss';


function useDisplay({
  varName,
  variantLookup
}) {
  if (!(varName in variantLookup)) {
    return '?';
  }
  const synonyms = variantLookup[varName]?.synonyms;

  if (synonyms && synonyms.length > 0) {
    return `${varName} (${synonyms[0]})`;
  }
  else {
    return varName;
  }
}


CellVariant.propTypes = {
  varName: PropTypes.string,
  potency: PropTypes.number,
  potencyUnit: PropTypes.string,
  potencyType: PropTypes.string,
  enablePotency: PropTypes.bool,
  ineffective: PropTypes.bool,
  variantLookup: PropTypes.object
};


export default function CellVariant({
  varName,
  potency,
  potencyUnit,
  potencyType,
  enablePotency,
  ineffective,
  variantLookup
}) {
  const isolateDisplay = useDisplay({
    varName,
    variantLookup
  });
  return (
    enablePotency && potency !== null && potency !== undefined ? <>
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
    </> : isolateDisplay
  );
}
