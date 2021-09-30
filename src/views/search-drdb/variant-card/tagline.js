import React from 'react';
import PropTypes from 'prop-types';

import Articles from '../hooks/articles';

import style from './style.module.scss';


const VARIANT_STATUS = [
  {
    name: 'VOC',
    label: 'Variant of Concern'
  },
  {
    name: 'VOI',
    label: 'Variant of Interest'
  },
  {
    name: 'VBM',
    label: 'Variant Being Monitored'
  }
];


TaglineRef.propTypes = {
  displayName: PropTypes.string.isRequired,
  doi: PropTypes.string,
  url: PropTypes.string
};

function TaglineRef({displayName, doi, url}) {
  return (
    <a
     href={doi ? `https://doi.org/${doi}` : url}
     target="_blank"
     rel="noreferrer">
      {displayName}
    </a>
  );
}


Tagline.propTypes = {
  asWildtype: PropTypes.bool,
  status: PropTypes.array.isRequired
};

export default function Tagline({asWildtype, status}) {
  const statusRefs = React.useMemo(
    () => status.reduce((acc, obj) => {
      acc[obj.status] = acc[obj.status] || [];
      acc[obj.status].push(obj.refName);
      return acc;
    }, {}),
    [status]
  );
  const {articleLookup, isPending} = Articles.useMe();

  if (isPending) {
    return null;
  }
  const variantStatus = VARIANT_STATUS.filter(
    ({name}) => name in statusRefs
  );

  return <>
    {asWildtype ? 'Wild type' : <>
      {variantStatus.map(
        ({name, label}, idx) => name in statusRefs ? (
          <span key={`status-${name}`} className={style['variant-status-one']}>
            {idx === 0 ? null : '\xa0\xa0|\xa0\xa0'}
            {label}{'\xa0'}
            <span className={style['variant-status-refs']}>
              [
              {statusRefs[name].map((refName, idx) => (
                <React.Fragment key={`ref-${refName}`}>
                  {idx > 0 ? ', ' : null}
                  <TaglineRef {...articleLookup[refName]} />
                </React.Fragment>
              ))}
              ]
            </span>
          </span>
        ) : null
      )}
    </>}
  </>;
}
