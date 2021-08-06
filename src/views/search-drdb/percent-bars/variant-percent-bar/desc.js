import React from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';

import {
  TYPE_VARIANT,
  TYPE_ISOAGG,
  TYPE_OTHER
} from './types';

import style from '../style.module.scss';

import {itemShape} from './prop-types';


VariantDesc.propTypes = {
  className: PropTypes.string,
  item: itemShape.isRequired
};

export default function VariantDesc({
  className,
  item
}) {
  const {
    display,
    displayExtra,
    type,
    numExp,
    subItems
  } = item;

  return (
    <div className={className}>
      <div className={style['title']}>
        {display}
        {displayExtra ? (
          <div className={style['title-extra']}>
            ({displayExtra})
          </div>
        ) : null}
      </div>
      <p>
        This category contains{' '}
        <strong>{numExp}</strong> {pluralize('result', numExp)}{' '}
        {type === TYPE_VARIANT ? <>
          from{' '}
          <strong>{pluralize('isolate', subItems.length, true)}</strong>
          {' '}{pluralize('is', subItems.length)} which are identified as{' '}
          <strong>{display}</strong> variant:
        </> : null}
        {type === TYPE_ISOAGG ? '.' : null}
        {type === TYPE_OTHER ? <>
          from{' '}
          <strong>{pluralize('variant', subItems.length, true)}</strong>:
        </> : null}
      </p>
      {type === TYPE_VARIANT || type === TYPE_OTHER ? (
        <ul>
          {subItems.map(({name, display, numExp}) => (
            <li key={name}>
              {display} (n=<strong>{numExp}</strong>)
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
