import React from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';

import {
  TYPE_VARIANT
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
        <strong>{numExp}</strong> {pluralize('result', numExp)}.{' '}
        {type === TYPE_VARIANT ? <>
          Following{' '}
          <strong>{pluralize('isolate', subItems.length, true)}</strong>
          {' '}{pluralize('is', subItems.length)} identified as{' '}
          <strong>{display}</strong> variant:
        </> : null}
      </p>
      {type === TYPE_VARIANT ? (
        <ul>
          {subItems.map(({display, numExp}) => (
            <li>{display} (n=<strong>{numExp}</strong>)</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
