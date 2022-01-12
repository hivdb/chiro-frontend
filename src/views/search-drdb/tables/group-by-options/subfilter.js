import React from 'react';
import {useRouter, Link} from 'found';
import capitalize from 'lodash/capitalize';
import snakeCase from 'lodash/snakeCase';
import PropTypes from 'prop-types';
import {AiOutlineCheck} from '@react-icons/all-files/ai/AiOutlineCheck';
import {AiOutlineClose} from '@react-icons/all-files/ai/AiOutlineClose';
import {AiOutlineArrowRight} from
  '@react-icons/all-files/ai/AiOutlineArrowRight';
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
  const allValues = options.map(({value}) => value).sort();

  return <span className={style['subfilter-options']}>
    ({
      options.map(({action, value, label, descAdd, descRemove}, idx) => {
        let curValues = curParams[action] || [];
        if (curValues.length === 0) {
          curValues = [...allValues];
        }
        const inCurValues = curValues.includes(value);

        return <React.Fragment key={`${action}__${value}`}>
          {idx > 0 ? ', ' : null}
          <Link
           to={{
             pathname: loc.pathname,
             query: buildLocationQuery(
               snakeCase(action),
               inCurValues ? (
                 curValues.length > 1 ?
                   curValues.filter(v => v !== value) :
                   allValues.filter(v => v !== value)
               ) : (
                 curValues.length + 1 === allValues.length ?
                   undefined :
                   [...curValues, value].sort()
               ),
               loc.query
             )
           }}
           className={style['subfilter']}>
            {label || capitalize(value)}
            <span className={style['filter-icons']}>
              {inCurValues ?
                <AiOutlineCheck className={style.yes} /> :
                <AiOutlineClose className={style.no} />}
            </span>
            <span className={style['filter-desc']}>
              {inCurValues ? <>
                <span data-transition className={style['filter-icons']}>
                  <AiOutlineCheck className={style.yes} />
                  <AiOutlineArrowRight className={style.transit} />
                  <AiOutlineClose className={style.no} />
                </span>{': '}
                {descRemove || 'Remove this filter'}
              </> : <>
                <span data-transition className={style['filter-icons']}>
                  <AiOutlineClose className={style.no} />
                  <AiOutlineArrowRight className={style.transit} />
                  <AiOutlineCheck className={style.yes} />
                </span>{': '}
                {descAdd || 'List filtered results'}
              </>}
            </span>
          </Link>
        </React.Fragment>;
      })
    })
  </span>;
}
