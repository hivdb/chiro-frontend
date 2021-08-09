import nestGet from 'lodash/get';
import nestSet from 'lodash/set';
import {buildLocationQuery} from '../hooks/location-params';

import {
  TYPE_VARIANT,
  TYPE_ISOAGG,
  TYPE_INFVAR,
  TYPE_VACCINE,
  TYPE_MAB
} from './types';


export function groupSmallSlices(
  array, 
  sizeKey, 
  groupItem,
  maxNumItems/*,
  maxScaledGroupPcnt = 0.35*/
) {
  const items = [...array].reverse();
  let totalSize = items.reduce(
    (acc, item) => acc + nestGet(item, sizeKey),
    0
  );
  let remainItems = items.length;
  let groupPcnt = .0;
  let groupItemSize = 0;
  const resultItems = [];
  const groupOrigItems = [];
  for (const item of items) {
    const size = nestGet(item, sizeKey);
    if (remainItems >= maxNumItems) {
      groupPcnt += size / totalSize;
      groupItemSize += size;
      groupOrigItems.push(item);
    }
    else {
      /*if (groupPcnt > maxScaledGroupPcnt) {
        groupPcnt = maxScaledGroupPcnt;
        const remainSize = totalSize - groupItemSize;
        totalSize = (remainSize / (1 - groupPcnt)).toFixed();
      }*/
      resultItems.push({
        pcnt: size / totalSize,
        item
      });
    }
    remainItems --;
  }
  resultItems.reverse();
  nestSet(groupItem, sizeKey, groupItemSize);
  if (groupItemSize > 0) {
    if (groupOrigItems.length > 1) {
      resultItems.push({
        pcnt: groupPcnt,
        item: {
          ...groupItem,
          subItems: groupOrigItems.reverse()
        }
      });
    }
    else {
      resultItems.push({
        pcnt: groupPcnt,
        item: groupOrigItems[0]
      });
    }
  }
  return resultItems;
}


export function typeToAction(type) {
  let action;

  switch (type) {
    case TYPE_VARIANT:
      action = 'variant';
      break;
    case TYPE_ISOAGG:
      action = 'mutations';
      break;
    case TYPE_INFVAR:
      action = 'cp';
      break;
    case TYPE_VACCINE:
      action = 'vaccine';
      break;
    case TYPE_MAB:
      action = 'antibodies';
      break;
    default:
      console.warn(`type not allowed: ${type}`);
  }

  return action;
}


export function buildResetQuery(type, baseQuery) {
  const action = typeToAction(type);
  return buildLocationQuery(
    action,
    undefined,
    baseQuery
  );
}

export function buildFilterQuery(type, value, baseQuery) {
  const action = typeToAction(type);
  if (action === 'antibodies') {
    value = 'any';
  }
  return buildLocationQuery(
    action,
    value,
    baseQuery
  );
}
