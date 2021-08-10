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
    fullDisplay,
    type,
    numExp,
    subItems
  } = item;

  const {match: {location: loc}} = useRouter();

  const compactList = subItems && subItems.length > 30;

  let infVars, vaccines;
  if (type === TYPE_OTHER) {
    infVars = subItems.filter(({type}) => type === TYPE_INFVAR);
    vaccines = subItems.filter(({type}) => type === TYPE_VACCINE);
  }
  const subItemsSum = subItems ?
    subItems.reduce((acc, {numExp}) => acc + numExp, 0) : 0;

  return (
    <div className={className}>
      <div className={style['title']}>
        {fullDisplay}
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
        <strong>{numExp.toLocaleString('en-US')}</strong>{' '}
        {pluralize('experiment result', numExp)}
        {type === TYPE_MAB ? <>
          {' from '}
          <strong>
            {subItems.length.toLocaleString('en-US')}
            {' '}
            {pluralize('monoclonal antibody', subItems.length, false)}
          </strong>:
        </> : null}
        {type === TYPE_OTHER ? <>
          {infVars.length > 0 ? <>
            {' of convalescent plasma from '}
            <strong>
              {infVars.length.toLocaleString('en-US')}
              {' '}
              {pluralize('different variant', infVars.length, false)}
            </strong> infected person:
          </> : null}
          {vaccines.length > 0 ? <>
            {' of '}
            <strong>
              {vaccines.length.toLocaleString('en-US')}
              {' '}
              {pluralize('vaccinee plasma', vaccines.length, false)}
            </strong>:
          </> : null}
        </> : null}
        {type !== TYPE_MAB && type !== TYPE_OTHER ? '.' : null}
      </p>
      {type === TYPE_MAB && subItemsSum > 0 ? <>
        <ul data-compact={compactList}>
          {subItems.map(({name, shortDisplay, numExp}) => (
            <li key={name}>
              <Link to={{
                pathname: loc.pathname,
                query: buildLocationQuery(
                  'antibodies',
                  name,
                  loc.query
                )
              }}>
                {shortDisplay}
              </Link> (n=<strong>{numExp.toLocaleString('en-US')}</strong>)
            </li>
          ))}
        </ul>
      </> : null}
      {type === TYPE_OTHER ? <>
        {infVars.length > 0 ? <>
          <ul data-compact={compactList}>
            {infVars.map(({name, shortDisplay, numExp}) => (
              <li key={name}>
                <Link to={{
                  pathname: loc.pathname,
                  query: buildLocationQuery(
                    'cp',
                    name,
                    loc.query
                  )
                }}>
                  {shortDisplay}
                </Link> (n=<strong>{numExp.toLocaleString('en-US')}</strong>)
              </li>
            ))}
          </ul>
        </> : null}
        {vaccines.length > 0 ? <>
          <ul data-compact={compactList}>
            {vaccines.map(({name, shortDisplay, numExp}) => (
              <li key={name}>
                <Link to={{
                  pathname: loc.pathname,
                  query: buildLocationQuery(
                    'vaccine',
                    name,
                    loc.query
                  )
                }}>
                  {shortDisplay}
                </Link> (n=<strong>{numExp.toLocaleString('en-US')}</strong>)
              </li>
            ))}
          </ul>
        </> : null}
      </> : null}
    </div>
  );
}
