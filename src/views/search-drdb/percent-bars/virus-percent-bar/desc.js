import React from 'react';
import {Link, useRouter} from 'found';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';

import {
  TYPE_VARIANT,
  TYPE_ISOAGG,
  TYPE_OTHER
} from '../types';

import style from '../style.module.scss';

import {buildResetQuery, buildFilterQuery} from '../funcs';
import {itemShape} from '../prop-types';


VirusDesc.propTypes = {
  className: PropTypes.string,
  item: itemShape.isRequired
};

export default function VirusDesc({
  className,
  item
}) {
  const {
    shortDisplay,
    fullDisplay,
    type,
    numExp,
    subItems
  } = item;

  const {match: {location: loc}} = useRouter();
  const compactList = subItems && subItems.length > 30;

  return (
    <div className={className}>
      <div className={style['title']}>
        {fullDisplay}
        {type !== TYPE_OTHER ?
          <div className={style['title-action']}>
            [
            <Link to={{
              pathname: loc.pathname,
              query: buildResetQuery(type, loc.query)
            }}>clear filter</Link>
            ]
          </div> : null}
      </div>
      <p>
        This category contains{' '}
        <strong>
          {numExp && numExp.toLocaleString('en-US')}
        </strong> {pluralize('neutralization test result', numExp)}
        {type === TYPE_VARIANT ? <>
          {' from '}
          <strong>
            {subItems.length.toLocaleString('en-US')}{' '}
            {pluralize('isolate', subItems.length, false)}
          </strong>
          {' '}which {pluralize('is', subItems.length)} identified as{' '}
          <strong>{shortDisplay}</strong> variant:
        </> : null}
        {type === TYPE_ISOAGG ? '.' : null}
        {type === TYPE_OTHER ? <>
          {' from '}
          <strong>{pluralize('variant', subItems.length, true)}</strong>:
        </> : null}
      </p>
      {type === TYPE_VARIANT || type === TYPE_OTHER ? (
        <ul data-compact={compactList}>
          {subItems.map(({name, type, shortDisplay, numExp}) => (
            <li key={name}>
              {type === TYPE_VARIANT || type === TYPE_ISOAGG ? (
                <Link to={{
                  pathname: loc.pathname,
                  query: buildFilterQuery(type, name, loc.query)
                }}>
                  {shortDisplay}
                </Link>
              ) : shortDisplay} (n=<strong>
                {numExp.toLocaleString('en-US')}
              </strong>)
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
