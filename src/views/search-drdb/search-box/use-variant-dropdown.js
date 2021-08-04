import React from 'react';
import pluralize from 'pluralize';
import {Dropdown} from 'semantic-ui-react';
import {
  useVariantNumExpLookup,
  useIsolateAggNumExpLookup,
  useVariantTotalNumExp
} from '../hooks';

import FragmentWithoutWarning from './fragment-without-warning';


const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';


export default function useVariantDropdown({
  loaded,
  variants,
  isolateAggs,
  articleValue,
  antibodyValue,
  vaccineValue,
  convPlasmaValue,
  variantValue,
  mutationText,
  onChange,
  formOnly
}) {
  const commonParams = {
    skip: !loaded,
    articleValue,
    antibodyValue,
    vaccineValue,
    convPlasmaValue
  };

  const [varTotalNumExp, isVarTotalNumExpPending] = useVariantTotalNumExp({
    ...commonParams
  });
  const [varNumExpLookup, isVarNumExpLookupPending] = useVariantNumExpLookup({
    ...commonParams
  });
  const [
    isoAggNumExpLookup,
    isIsoAggNumExpLookupPending
  ] = useIsolateAggNumExpLookup({
    ...commonParams
  });

  const isPending = (
    !loaded ||
    isVarTotalNumExpPending ||
    isVarNumExpLookupPending ||
    isIsoAggNumExpLookupPending
  );

  const variantOptions = React.useMemo(
    () => {
      if (isPending) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          ...(variantValue ? [{
            key: variantValue,
            text: variantValue,
            value: variantValue
          }] : []),
          ...(mutationText ? [{
            key: mutationText,
            text: mutationText,
            value: mutationText
          }] : [])
        ];
      }
      else {
        const displayVariants = variants
          .map(
            ({varName, synonyms}) => ({
              varName,
              synonyms,
              numExp: varNumExpLookup[varName] || 0
            })
          )
          .filter(({numExp}) => numExp > 0)
          .sort((a, b) => b.numExp - a.numExp);

        const displayIsolateAggs = isolateAggs
          .map(
            ({isoAggkey, isoAggDisplay}) => ({
              isoAggkey,
              isoAggDisplay,
              numExp: isoAggNumExpLookup[isoAggkey] || 0
            })
          )
          .filter(({numExp}) => numExp > 0)
          .sort((a, b) => b.numExp - a.numExp);

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
              varTotalNumExp,
              true
            )
          },
          ...(displayVariants.length > 0 ? [
            {
              key: 'variant-divider',
              as: FragmentWithoutWarning,
              children: <Dropdown.Divider />
            },
            ...displayVariants
              .map(
                ({varName, synonyms, numExp}) => ({
                  key: varName,
                  text: (
                    synonyms.length > 0 ?
                      `${varName} (${synonyms[0]})` : varName
                  ),
                  value: varName,
                  type: 'variant',
                  description: pluralize('result', numExp, true)
                })
              )
          ] : []),
          ...(displayIsolateAggs.length > 0 ? [
            {
              key: 'combomut-divider',
              as: FragmentWithoutWarning,
              children: <Dropdown.Divider />
            },
            ...displayIsolateAggs
              .map(
                ({isoAggkey, isoAggDisplay, numExp}) => ({
                  key: isoAggkey,
                  text: isoAggDisplay,
                  value: isoAggkey,
                  type: 'mutations',
                  description: pluralize('result', numExp, true)
                })
              )
          ] : [])
        ];
      }
    },
    [
      isPending,
      variants,
      isolateAggs,
      variantValue,
      mutationText,
      formOnly,
      varTotalNumExp,
      varNumExpLookup,
      isoAggNumExpLookup
    ]
  );

  const handleChange = React.useCallback(
    (evt, {value, options}) => {
      if (value === EMPTY) {
        evt.preventDefault();
      }
      else {
        if (value === ANY) {
          onChange({
            variant: undefined,
            mutations: undefined
          });
        }
        else {
          const {type} = options.find(opt => opt.value === value);
          onChange(type, value);
        }
      }
    },
    [onChange]
  );

  const defaultValue = formOnly ? EMPTY : ANY;

  return (
    <Dropdown
     search direction="right"
     placeholder={EMPTY_TEXT}
     options={variantOptions}
     onChange={handleChange}
     value={variantValue || mutationText || defaultValue} />
  );
}
