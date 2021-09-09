import React from 'react';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';


HeadNote.propTypes = {
  numRows: PropTypes.number.isRequired,
  numExps: PropTypes.number.isRequired,
  numArticles: PropTypes.number.isRequired,
  numNoNatExps: PropTypes.number.isRequired,
  hideNN: PropTypes.bool,
  onToggleHideNN: PropTypes.func
};


export default function HeadNote({
  numRows,
  numExps,
  numArticles,
  numNoNatExps,
  hideNN = false,
  onToggleHideNN
}) {
  return <div>
    <em>
      <strong>{numExps.toLocaleString('en-US')}</strong>{' '}
      {pluralize('result', numExps, false)}{'; '}
      <strong>{numRows.toLocaleString('en-US')}</strong>{' '}
      {pluralize('experimental condition', numRows, false)}{' '}
      ({pluralize('row', numRows, false)}){'; '}
      <strong>{numArticles.toLocaleString('en-US')}</strong>{' '}
      {pluralize('publications', numArticles, false)}.
      {numNoNatExps > 0 ? <>
        <br />
        <strong>{numNoNatExps.toLocaleString('en-US')}</strong>{' '}
        {pluralize('results', numNoNatExps, false)}{' '}
        had titers against the control virus below the experimental detection
        threshold{hideNN ? ' and are not shown' : null}.
      </> : null}
    </em>
    {numNoNatExps > 0 ? <>
      {' '}(<a onClick={onToggleHideNN} href="#toggle-hide">
        {hideNN ? 'unhide' : 'hide'}
      </a>)
    </> : null}
  </div>;
}
