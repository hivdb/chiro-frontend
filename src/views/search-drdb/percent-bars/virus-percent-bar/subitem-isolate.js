import React from 'react';
import PropTypes from 'prop-types';
import shortenMutList from '../../../../utils/shorten-mutlist';

SubItemIsolate.propTypes = {
  gisaidId: PropTypes.number,
  genbankAccn: PropTypes.string,
  mutations: PropTypes.array.isRequired
};

export default function SubItemIsolate({
  gisaidId,
  genbankAccn,
  mutations
}) {
  const isSpikeOnly = mutations.every(({gene}) => gene === 'S');
  const displaySuffix = isSpikeOnly ? null : <>
    {' + '}<em>non-Spike mutations</em>
  </>;
  const shortMuts = shortenMutList(mutations);
  return <>
    {genbankAccn ? <>
      <a
       href={`https://www.ncbi.nlm.nih.gov/nuccore/${genbankAccn}`}
       target="_blank" rel="noreferrer">
        <strong>{genbankAccn}</strong>
      </a>{': '}
    </> : null}
    {!genbankAccn && gisaidId ? <>
      <a
       href="https://platform.epicov.org/epi3/frontend"
       target="_blank" rel="noreferrer">
        <strong>EPI_ISL_{gisaidId}</strong>
      </a>{': '}
    </> : null}

    {shortMuts.length > 0 ?
      shortMuts.join(' + ') : <em>Spike wildtype</em>}
    {displaySuffix}
  </>;
}
