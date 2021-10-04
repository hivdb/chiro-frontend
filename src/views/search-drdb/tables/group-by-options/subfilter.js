import React from 'react';
import {useRouter, Link} from 'found';
import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import {RiFilterFill} from '@react-icons/all-files/ri/RiFilterFill';
import {RiFilterOffFill} from '@react-icons/all-files/ri/RiFilterOffFill';
import LocationParams, {buildLocationQuery} from '../../hooks/location-params';

import style from './style.module.scss';


Subfilter.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      action: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      label: PropTypes.node,
      descAdd: PropTypes.node,
      descRemove: PropTypes.node
    }).isRequired
  ).isRequired
};


export function useResetAllSubfilters(allOptions) {
  const {router, match: {location: loc}} = useRouter();

  return React.useCallback(
    () => {
      const resets = {};
      for (const options of Object.values(allOptions)) {
        for (const {action} of options) {
          resets[action] = undefined;
        }
      }
      router.push({
        pathname: loc.pathname,
        query: buildLocationQuery(resets, undefined, loc.query)
      });
    },
    [allOptions, loc.pathname, loc.query, router]
  );
}


export default function Subfilter({options}) {
  const {params: curParams} = LocationParams.useMe();
  const {match: {location: loc}} = useRouter();

  return <span className={style['subfilter-options']}>
    ({
      options.map(({action, value, label, descAdd, descRemove}, idx) => {
        const isCurValue = curParams[action] === value;

        return <React.Fragment key={`${action}__${value}`}>
          {idx > 0 ? ', ' : null}
          {isCurValue ?
            <>
              {label || capitalize(value)}
              <Link
               to={{
                 pathname: loc.pathname,
                 query: buildLocationQuery(action, undefined, loc.query)
               }}
               className={style['subfilter']}>
                <span className={style['filter-icons']}>
                  <RiFilterFill data-display-when="initial" />
                  <RiFilterOffFill data-display-when="hover" />
                </span>
                <span className={style['filter-desc']}>
                  {descRemove || 'List all results'}
                </span>
              </Link>
            </> :
            <Link
             to={{
               pathname: loc.pathname,
               query: buildLocationQuery(action, value, loc.query)
             }}
             className={style['subfilter']}>
              {label || capitalize(value)}
              <span className={style['filter-desc']}>
                {descAdd || 'List filtered results'}
              </span>
            </Link>}
        </React.Fragment>;
      })
    })
  </span>;
}
