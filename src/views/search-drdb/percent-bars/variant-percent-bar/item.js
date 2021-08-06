import React from 'react';
import {useRouter} from 'found';
import PropTypes from 'prop-types';

import {
  TYPE_VARIANT,
  TYPE_ISOAGG,
  TYPE_OTHER
} from './types';
import {
  buildLocationQuery
} from '../../hooks';
import PercentBar from '../../../../components/percent-bar';

import style from '../style.module.scss';

import {itemShape} from './prop-types';
import VariantDesc from './desc';


VariantSlice.propTypes = {
  index: PropTypes.number.isRequired,
  pcnt: PropTypes.number.isRequired,
  item: itemShape.isRequired,
  variantValue: PropTypes.string,
  mutationText: PropTypes.string
};

export default function VariantSlice({
  pcnt,
  item,
  index,
  variantValue,
  mutationText
}) {
  const {
    name,
    display,
    type,
    numExp
  } = item;
  const {match: {location: loc}} = useRouter();
  const isActive = !!(
    (type === TYPE_VARIANT && variantValue === name) ||
    (type === TYPE_ISOAGG && mutationText === name)
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
