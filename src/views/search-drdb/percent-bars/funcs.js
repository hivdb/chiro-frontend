import nestGet from 'lodash/get';
import nestSet from 'lodash/set';


export function groupSmallSlices(
  array, 
  sizeKey, 
  groupItem,
  maxNumItems,
  maxScaledGroupPcnt = 0.35
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
      if (groupPcnt > maxScaledGroupPcnt) {
        groupPcnt = maxScaledGroupPcnt;
        const remainSize = totalSize - groupItemSize;
        totalSize = (remainSize / (1 - groupPcnt)).toFixed();
      }
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
    resultItems.push({
      pcnt: groupPcnt,
      item: {
        ...groupItem,
        subItems: groupOrigItems.reverse()
      }
    });
  }
  return resultItems;
}
