import React from 'react';
import {useRouter} from 'found';
import PropTypes from 'prop-types';

import {
  TYPE_VARIANT,
  TYPE_ISOAGG,
  TYPE_OTHER
} from './types';
import LocationParams, {
  buildLocationQuery
} from '../../hooks/location-params';

import PercentBar from '../../../../components/percent-bar';

import style from '../style.module.scss';

import {itemShape} from './prop-types';
import VariantDesc from './desc';


VariantSlice.propTypes = {
  index: PropTypes.number.isRequired,
  pcnt: PropTypes.number.isRequired,
  item: itemShape.isRequired
};

export default function VariantSlice({
  pcnt,
  item,
  item: {name, display, type, numExp},
  index
}) {
  const {
    params: {
      varName,
      isoAggkey
    }
  } = LocationParams.useMe();
  const {match: {location: loc}} = useRouter();
  const isActive = !!(
    (type === TYPE_VARIANT && varName === name) ||
    (type === TYPE_ISOAGG && isoAggkey === name)
  );

  return (
    <PercentBar.Item
     fixedHoverDesc
     index={index}
     isActive={isActive}
     to={{
       pathname: loc.pathname,
       query: buildLocationQuery(
         type === TYPE_OTHER ? {
           variant: undefined,
           mutations: undefined
         } : (
           type === TYPE_VARIANT ? 'variant' : 'mutations'
         ),
         name,
         loc.query
       )
     }}
     className={style['percent-bar-item_variant']}
     title={`${display} (n=${numExp})`}
     percent={pcnt}>
      <VariantDesc item={item} className={style['percent-bar-desc']} />
    </PercentBar.Item>
  );
}
