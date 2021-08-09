import React from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import {Link, useRouter} from 'found';

import {
  TYPE_INFVAR,
  TYPE_VACCINE,
  TYPE_MAB,
  TYPE_OTHER
} from '../types';

import {buildLocationQuery} from '../../hooks/location-params';

import style from '../style.module.scss';

import {itemShape} from '../prop-types';


RxDesc.propTypes = {
  className: PropTypes.string,
  item: itemShape.isRequired
};

export default function RxDesc({
  className,
  item
}) {
  const {
    display,
    displayExtra,
    displayAfterExtra,
    type,
    numExp,
    subItems
  } = item;

  const {match: {location: loc}} = useRouter();

  const compactList = subItems && subItems.length > 30;

  let infVars, vaccines, infVarsSum, vaccinesSum;
  if (type === TYPE_OTHER) {
    infVars = subItems.filter(({type}) => type === TYPE_INFVAR);
    vaccines = subItems.filter(({type}) => type === TYPE_VACCINE);
    infVarsSum = infVars.reduce((acc, {numExp}) => acc + numExp, 0);
    vaccinesSum = vaccines.reduce((acc, {numExp}) => acc + numExp, 0);
  }
  const subItemsSum = subItems ?
    subItems.reduce((acc, {numExp}) => acc + numExp, 0) : 0;

  return (
    <div className={className}>
      <div className={style['title']}>
        {display}
        {displayExtra ? (
          <div className={style['title-extra']}>
            ({displayExtra})
          </div>
        ) : null}
        {displayAfterExtra}
        {type !== TYPE_OTHER ?
          <div className={style['title-action']}>
            [
            <Link to={{
              pathname: loc.pathname,
              query: buildLocationQuery(
                type === TYPE_INFVAR ? 'cp' : (
                  type === TYPE_VACCINE ? 'vaccine' : 'antibodies'
                ),
                undefined,
                loc.query
              )
            }}>clear filter</Link>
            ]
          </div> : null}
      </div>
      <p>
        This category contains{' '}
        <strong>{numExp}</strong> {pluralize('result', numExp)}
        {type === TYPE_MAB ? <>
          {' from '}
          <strong>
            {pluralize('monoclonal antibody', subItems.length, true)}
          </strong>:
        </> : '.'}
      </p>
      {type === TYPE_MAB && subItemsSum > 0 ? <>
        <ul data-compact={compactList}>
          {subItems.map(({name, display, numExp}) => (
            <li key={name}>
              <Link to={{
                pathname: loc.pathname,
                query: buildLocationQuery(
                  'antibodies',
                  name,
                  loc.query
                )
              }}>
                {display}
              </Link> (n=<strong>{numExp}</strong>)
            </li>
          ))}
        </ul>
      </> : null}
      {type === TYPE_OTHER ? <>
        {infVars.length > 0 ? <>
          <p>
            Of which, <strong>{infVarsSum}</strong>{' '}
            {pluralize('is', infVarsSum)}
            {' from '}
            <strong>
              {pluralize('infected variant', infVars.length, true)}
            </strong>:
          </p>
          <ul data-compact={compactList}>
            {infVars.map(({name, display, displayAfterExtra, numExp}) => (
              <li key={name}>
                <Link to={{
                  pathname: loc.pathname,
                  query: buildLocationQuery(
                    'cp',
                    name,
                    loc.query
                  )
                }}>
                  {display}{displayAfterExtra}
                </Link> (n=<strong>{numExp}</strong>)
              </li>
            ))}
          </ul>
        </> : null}
        {vaccines.length > 0 ? <>
          <p>
            Of which, <strong>{vaccinesSum}</strong>{' '}
            {pluralize('is', vaccinesSum)}
            {' from '}
            <strong>
              {pluralize('vaccine', vaccines.length, true)}
            </strong>:
          </p>
          <ul data-compact={compactList}>
            {vaccines.map(({name, display, numExp}) => (
              <li key={name}>
                <Link to={{
                  pathname: loc.pathname,
                  query: buildLocationQuery(
                    'vaccine',
                    name,
                    loc.query
                  )
                }}>
                  {display}
                </Link> (n=<strong>{numExp}</strong>)
              </li>
            ))}
          </ul>
        </> : null}
      </> : null}
    </div>
  );
}
