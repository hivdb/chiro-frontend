import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';


FootnotesCell.propTypes = {
  footnotes: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired
  ).isRequired,
  orderedColTypes: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  refNames: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
};

export default function FootnotesCell({
  footnotes,
  orderedColTypes,
  refNames
}) {
  const uniqueRefNames = React.useMemo(
    () => {
      const uniqueRefNames = {};
      for (const colType of orderedColTypes) {
        const fnRefNames = footnotes[colType];
        if (!fnRefNames) {
          continue;
        }
        for (const refName of fnRefNames) {
          uniqueRefNames[refNames.indexOf(refName)] = refName;
        }
      }
      return Object.entries(uniqueRefNames).map(
        ([idx, refName]) => [parseInt(idx, 10), refName]
      );
    },
    [footnotes, orderedColTypes, refNames]
  );

  return <sup className={style['footnotes-cell']}>
    [{uniqueRefNames.map(
    ([idx, refName], jdx) => {
      return <React.Fragment key={refName}>
        {jdx === 0 ? null : ', '}
        <a key={refName} href={`#fn-${refName}`}>
          {idx + 1}
        </a>
      </React.Fragment>;
    }
  )}]
  </sup>;
}
