import React from 'react';
import {useRouter} from 'found';
import PropTypes from 'prop-types';

import {
  TYPE_VARIANT,
  TYPE_ISOAGG,
  TYPE_INFVAR,
  TYPE_VACCINE,
  TYPE_MAB,
  TYPE_OTHER
} from './types';
import LocationParams from '../hooks/location-params';

import PercentBar from '../../../components/percent-bar';

import style from './style.module.scss';

import {itemShape} from './prop-types';
import {buildResetQuery, buildFilterQuery} from './funcs';


VariantRxItem.propTypes = {
  styleType: PropTypes.oneOf(['variant', 'rx']).isRequired,
  indexGroup: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.string.isRequired
  ]),
  index: PropTypes.number.isRequired,
  pcnt: PropTypes.number.isRequired,
  item: itemShape.isRequired,
  descComponent: PropTypes.func
};

export default function VariantRxItem({
  pcnt,
  item,
  item: {name, shortDisplay, type, numExp},
  indexGroup,
  index,
  styleType,
  descComponent
}) {
  const {
    params: {
      varName,
      isoAggkey,
      abNames,
      infectedVarName,
      vaccineName
    }
  } = LocationParams.useMe();
  const {match: {location: loc}} = useRouter();
  const isActive = !!(
    (type === TYPE_VARIANT && varName === name) ||
    (type === TYPE_ISOAGG && isoAggkey === name) ||
    (type === TYPE_INFVAR && infectedVarName === name) ||
    (type === TYPE_VACCINE && vaccineName === name) ||
    (type === TYPE_MAB && abNames && abNames.length > 0)
  );

  return (
    <PercentBar.Item
     fixedHoverDesc
     indexGroup={indexGroup}
     index={index}
     isActive={isActive}
     to={type === TYPE_OTHER ? undefined : {
       pathname: loc.pathname,
       query: buildFilterQuery(type, name, loc.query)
     }}
     clearButton={isActive ? {
       to: {
         pathname: loc.pathname,
         query: buildResetQuery(type, loc.query)
       }
     } : null
      }
     className={style[`percent-bar-item_${styleType}`]}
     title={<>
       {shortDisplay} (n={numExp && numExp.toLocaleString('en-US')})
     </>}
     percent={pcnt}>
      {React.createElement(descComponent, {
        item, className: style['percent-bar-desc']
      })}
    </PercentBar.Item>
  );
}
