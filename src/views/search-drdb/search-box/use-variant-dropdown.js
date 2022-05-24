import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import escapeRegExp from 'lodash/escapeRegExp';
import {NumExpStats} from '../hooks/susc-summary';
import LocationParams from '../hooks/location-params';
import Variants from '../hooks/variants';
import InVitroMutations from '../hooks/invitro-mutations';
import InVivoMutations from '../hooks/invivo-mutations';
import DMSMutations from '../hooks/dms-mutations';

import FragmentWithoutWarning from './fragment-without-warning';
import Desc from './desc';
import style from './style.module.scss';


const EMPTY = 'empty';
const ANY = 'any';
const EMPTY_TEXT = 'Select item';


function orderedSearch(options, query) {
  const re = new RegExp(escapeRegExp(query), 'i');
  return options
    .filter((opt) => re.test(opt.text))
    .sort(
      (a, b) => {
        let cmp = re.exec(a.text).index - re.exec(b.text).index;
        if (cmp) {
          return cmp;
        }
        if (a.text < b.text) {
          return -1;
        }
        else if (a.text > b.text) {
          return 1;
        }
        return 0;
      }
    );
}


export default function useVariantDropdown() {

  const {
    params: {
      // abNames: paramAbNames,
      varName: paramVarName,
      isoAggkey: paramIsoAggKey,
      genePos: paramGenePos,
      formOnly
    },
    onChange
  } = LocationParams.useMe();

  const {
    variants,
    isPending: isVarsPending
  } = Variants.useMe();

  const [
    varNumExpLookup,
    isVarNumExpLookupPending
  ] = NumExpStats.useVar();

  const [
    numInVitroMuts,
    isInVitroMutsPending
  ] = InVitroMutations.useSummaryByVirus();

  const [
    numInVivoMuts,
    isInVivoMutsPending
  ] = InVivoMutations.useSummaryByVirus();

  const [
    numDMSMuts,
    isDMSMutsPending
  ] = DMSMutations.useSummaryByVirus();

  const isPending = (
    isVarsPending ||
    isVarNumExpLookupPending ||
    isInVitroMutsPending ||
    isInVivoMutsPending ||
    isDMSMutsPending
  );

  const finalVarNumExpLookup = React.useMemo(() => {
    const finalVarNumExpLookup = {...varNumExpLookup};

    for (const {varNames, count} of [
      ...numInVitroMuts,
      ...numInVivoMuts,
      ...numDMSMuts
    ]) {
      finalVarNumExpLookup[ANY] += count;
      for (const varName of varNames) {
        finalVarNumExpLookup[varName] = finalVarNumExpLookup[varName] || 0;
        finalVarNumExpLookup[varName] += count;
      }
    }
    return finalVarNumExpLookup;
  }, [
    numInVitroMuts,
    numInVivoMuts,
    numDMSMuts,
    varNumExpLookup
  ]);

  const variantOptions = React.useMemo(
    () => {
      if (isPending) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          ...(paramVarName ? [{
            key: paramVarName,
            text: paramVarName,
            value: paramVarName
          }] : [])
        ];
      }
      else {
        const approx = false; // paramAbNames && paramAbNames.length > 1;
        const displayVariants = variants
          .map(
            ({varName, synonyms, asWildtype}) => ({
              varName,
              synonyms,
              asWildtype,
              numExp: finalVarNumExpLookup[varName] || 0
            })
          )
          .filter(({varName, asWildtype, numExp}) => (
            varName === paramVarName || (!asWildtype && numExp > 0)
          ))
          .sort((a, b) => b.numExp - a.numExp);

        return [
          ...(formOnly ? [{
            key: 'empty',
            text: EMPTY_TEXT,
            value: EMPTY
          }] : []),
          {
            key: ANY,
            text: 'Any',
            value: ANY,
            description: (
              <Desc
               approx={approx}
               n={finalVarNumExpLookup[ANY]} />
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
                  description: (
                    <Desc
                     approx={approx}
                     n={numExp} />
                  )
                })
              )
          ] : [])
        ];
      }
    },
    [
      isPending,
      paramVarName,
      variants,
      formOnly,
      finalVarNumExpLookup
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
            mutations: undefined,
            position: undefined
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
    <div
     data-loaded={!isPending}
     className={style['search-box-dropdown-container']}>
      <Dropdown
       search={orderedSearch}
       direction="right"
       placeholder={EMPTY_TEXT}
       options={variantOptions}
       onChange={handleChange}
       value={
         paramVarName ||
           paramIsoAggKey ||
           paramGenePos ||
           defaultValue
        } />
    </div>
  );
}
