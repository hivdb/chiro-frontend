import React from 'react';

export default function useLookup(valueList, keyName, skip) {
  const lookup = React.useMemo(
    () => {
      const valueLookup = {};
      if (!skip) {
        for (const value of valueList) {
          const keyValue = value[keyName];
          valueLookup[keyValue] = value;
        }
      }
      return valueLookup;
    },
    [valueList, keyName, skip]
  );
  return lookup;
}
