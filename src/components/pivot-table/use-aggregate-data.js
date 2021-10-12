import React from 'react';
import uniq from 'lodash/uniq';
import nestedGet from 'lodash/get';


export default function useAggregateData({
  data,
  columnDefs,
  groupBy,
  skip = false
}) {
  const aggColumns = React.useMemo(
    () => skip || uniq([
      ...columnDefs
        .map(({name}) => name),
      ...Object.keys(data[0] || [])
    ]).filter(name => !groupBy.includes(name)),
    [columnDefs, data, groupBy, skip]
  );

  return React.useMemo(
    () => {
      if (skip) { return []; }
      const aggregated = [];
      for (const row of data) {
        let aggObj = {};
        for (const name of groupBy) {
          aggObj[name] = nestedGet(row, name);
        }
        const groupKey = JSON.stringify(aggObj);

        if (!aggregated[groupKey]) {
          for (const name of aggColumns) {
            aggObj[name] = [];
          }
        }
        else {
          aggObj = aggregated[groupKey];
        }
        for (const name of aggColumns) {
          aggObj[name].push(nestedGet(row, name));
        }
        aggregated[groupKey] = aggObj;
      }
      return Object.values(aggregated);
    },
    [aggColumns, data, groupBy, skip]
  );

}
