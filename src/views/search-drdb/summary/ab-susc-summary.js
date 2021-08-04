/*import React from 'react';
import PropTypes from 'prop-types';
import {useSuscSummary} from '../hooks';

import {
  AntibodySuscSummaryTable
} from 'sierra-frontend/dist/components/susc-summary/ab-susc-summary';
*/

function AbSuscSummary({
  loaded,
  antibodyLookup,
  isolateAggs,
  articleValue, 
  variantValue,
  mutationText
}) {
  return null;
  /*const varSuscSummary = useSuscSummary({
    aggregateBy: [
      'antibody', 'variant',
      'potency_type', 'potency_unit'
    ],
    refName: articleValue,
    varName: variantValue,
    skip: !loaded
  });

  const mutSuscSummary = useSuscSummary({
    aggregateBy: [
      'antibody', 'isolate_agg',
      'potency_type', 'potency_unit'
    ],
    refName: articleValue,
    isoAggkey: mutationText,
    skip: !loaded
  });

  return null;
   return <pre>
    {JSON.stringify([
      varSuscSummary, mutSuscSummary
    ], null, '  ')}
  </pre>; */
}

export default AbSuscSummary;
