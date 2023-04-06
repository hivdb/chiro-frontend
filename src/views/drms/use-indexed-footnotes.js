import React from 'react';


export default function useIndexedFootnotes(
  drms,
  orderedColTypes
) {
  return React.useMemo(
    () => {
      const refNames = {};
      for (const {footnotes} of drms) {
        for (const colType of orderedColTypes) {
          const refs = footnotes[colType] || [];
          if (refs) {
            for (const refName of refs) {
              refNames[refName] = true;
            }
          }
        }
      }
      return Object.keys(refNames);
    },
    [drms, orderedColTypes]
  );
}
