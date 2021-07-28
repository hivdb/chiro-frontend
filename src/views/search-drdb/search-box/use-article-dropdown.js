import React from 'react';
import pluralize from 'pluralize';
import {Dropdown} from 'semantic-ui-react';

import {useSuscSummary} from '../hooks';

const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';


function useArticleNumExperimentLookup({
  skip,
  articleValue,
  antibodyValue,
  vaccineValue,
  convPlasmaValue,
  variantValue,
  mutationText
}) {
  const aggregateBy = [];
  if (antibodyValue && antibodyValue.length > 0) {
    if (antibodyValue.length === 1) {
      aggregateBy.push('antibody:indiv');
    }
    else {
      aggregateBy.push('antibody');
    }
  }
  if (vaccineValue) {
    aggregateBy.push('vaccine');
  }
  if (convPlasmaValue) {
    aggregateBy.push('infected_variant');
  }
  if (variantValue) {
    aggregateBy.push('variant');
  }
  if (mutationText) {
    aggregateBy.push('isolate_agg');
  }
  const {
    suscSummary,
    isPending: isSuscSummaryPending
  } = useSuscSummary({
    aggregateBy: ['article', ...aggregateBy],
    antibodyNames: antibodyValue,
    vaccineName: vaccineValue,
    infectedVariant: convPlasmaValue,
    varName: variantValue,
    isoAggkey: mutationText,
    skip
  });
  const {
    suscSummary: anySuscSummary,
    isPending: isAnySuscSummaryPending
  } = useSuscSummary({
    aggregateBy,
    antibodyNames: antibodyValue,
    vaccineName: vaccineValue,
    infectedVariant: convPlasmaValue,
    varName: variantValue,
    isoAggkey: mutationText,
    skip
  });
  const isPending = isSuscSummaryPending || isAnySuscSummaryPending;

  const lookup = React.useMemo(
    () => {
      if (skip || isPending) {
        return {};
      }
      const lookup = {
        __ANY: anySuscSummary[0]?.numExperiments || 0
      };
      for (const one of suscSummary) {
        lookup[one.refName] = one.numExperiments;
      }
      return lookup;
    },
    [skip, isPending, suscSummary, anySuscSummary]
  );
  return [lookup, isPending];
}


export default function useArticleDropdown({
  loaded,
  articleValue,
  antibodyValue,
  vaccineValue,
  convPlasmaValue,
  variantValue,
  mutationText,
  articles,
  onChange,
  formOnly
}) {
  const [numExpLookup, isPending] = useArticleNumExperimentLookup({
    skip: !loaded,
    articleValue,
    antibodyValue,
    vaccineValue,
    convPlasmaValue,
    variantValue,
    mutationText
  });
  const articleOptions = React.useMemo(
    () => {
      if (!loaded || isPending) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          {
            key: articleValue,
            text: articleValue,
            value: articleValue
          }
        ];
      }
      else {
        return [
          ...(formOnly ? [{
            key: 'empty',
            text: EMPTY_TEXT,
            value: EMPTY
          }] : []),
          {
            key: 'any',
            text: 'Any',
            value: ANY,
            description: pluralize(
              'result',
              numExpLookup[ANY],
              true
            ),
          },
          ...(
            !articleValue || articles.some(
              ({refName}) => articleValue === refName
            ) ?
              [] :
              [{
                key: articleValue,
                text: articleValue,
                value: articleValue
              }]
          ),
          ...articles.map(
            ({refName, displayName}) => ({
              key: refName,
              text: displayName,
              value: refName,
              description: pluralize(
                'result',
                numExpLookup[refName] || 0,
                true),
              'data-is-empty': !numExpLookup[refName]
            })
          ).sort((a, b) => {
            let cmp = a['data-is-empty'] - b['data-is-empty'];
            if (cmp === 0) {
              cmp = a.value.localeCompare(b.value);
            }
            return cmp;
          })
        ];
      }
    },
    [
      loaded, isPending, articles, articleValue,
      formOnly, numExpLookup
    ]
  );

  const handleChange = React.useCallback(
    (evt, {value, options}) => {
      if (value === EMPTY) {
        evt.preventDefault();
      }
      else {
        onChange('article', value === ANY ? undefined : value);
      }
    },
    [onChange]
  );

  const defaultValue = formOnly ? EMPTY : ANY;

  return (
    <Dropdown
     search direction="left"
     placeholder={EMPTY_TEXT}
     options={articleOptions}
     onChange={handleChange}
     value={articleValue || defaultValue} />
  );
}
