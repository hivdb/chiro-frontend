import React from 'react';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';


HeadNote.propTypes = {
  numRows: PropTypes.number.isRequired,
  numExps: PropTypes.number.isRequired,
  numArticles: PropTypes.number.isRequired,
  numNoNatExps: PropTypes.number.isRequired,
  numNon50Exps: PropTypes.number.isRequired,
  mainPotencyType: PropTypes.string.isRequired,
  hideNN: PropTypes.bool,
  debugOnlyNN: PropTypes.bool,
  onToggleHideNN: PropTypes.func,
  hideNon50: PropTypes.bool,
  onToggleHideNon50: PropTypes.func
};


export default function HeadNote({
  numRows,
  numExps,
  numArticles,
  numNoNatExps,
  numNon50Exps,
  mainPotencyType,
  hideNN = true,
  debugOnlyNN = false,
  onToggleHideNN,
  hideNon50 = true,
  onToggleHideNon50
}) {
  return <div>
    {debugOnlyNN ? <strong><code>debug=onlyNN</code>: </strong> : <em>
      <strong>{numExps.toLocaleString('en-US')}</strong>{' '}
      {pluralize('result', numExps, false)}{'; '}
      <strong>{numRows.toLocaleString('en-US')}</strong>{' '}
      {pluralize('experimental condition', numRows, false)}{' '}
      ({pluralize('row', numRows, false)}){'; '}
      <strong>{numArticles.toLocaleString('en-US')}</strong>{' '}
      {pluralize('publications', numArticles, false)}.
    </em>}
    {numNoNatExps > 0 ? <>
      <br />
      <em>
        <strong>{numNoNatExps.toLocaleString('en-US')}</strong>{' '}
        {pluralize('results', numNoNatExps, false)} had{' '}
        {pluralize('titers', numNoNatExps, false)} against the control virus
        below the experimental detection threshold
        {debugOnlyNN ? ' are only shown' : (
          hideNN ? ' and are not shown' : null
        )}.
      </em>
      {debugOnlyNN ? null : <>
        {' '}(<a onClick={onToggleHideNN} href="#toggle-hideNN">
          {hideNN ? 'unhide' : 'hide'}
        </a>)
      </>}
    </> : null}
    {numNon50Exps > 0 ? <>
      <br />
      <em>
        <strong>{numNon50Exps.toLocaleString('en-US')}</strong>{' '}
        {pluralize('results', numNon50Exps, false)}{' '}
        had non-{mainPotencyType} results
        {hideNon50 ? ' and are not shown' : null}.
      </em>
      {' '}(<a onClick={onToggleHideNon50} href="#toggle-hideNon50">
        {hideNon50 ? 'unhide' : 'hide'}
      </a>)
    </> : null}
  </div>;
}
