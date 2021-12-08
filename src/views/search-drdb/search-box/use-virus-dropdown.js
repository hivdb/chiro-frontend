import React from 'react';
import pluralize from 'pluralize';
import {Dropdown} from 'semantic-ui-react';
import escapeRegExp from 'lodash/escapeRegExp';
import {NumExpStats} from '../hooks/susc-summary';
import LocationParams from '../hooks/location-params';
import Variants from '../hooks/variants';
import IsolateAggs, {compareIsolateAggs} from '../hooks/isolate-aggs';
import Positions from '../hooks/positions';
import InVitroMutations from '../hooks/invitro-mutations';
import InVivoMutations from '../hooks/invivo-mutations';
import DMSMutations from '../hooks/dms-mutations';

import FragmentWithoutWarning from './fragment-without-warning';
import style from './style.module.scss';


const EMPTY = '__EMPTY';
const ANY = '__ANY';
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


export default function useVirusDropdown() {

  const {
    params: {
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

  const {
    isolateAggs,
    isPending: isIsoAggsPending
  } = IsolateAggs.useMe();

  const {
    positions,
    isPending: isPositionsPending
  } = Positions.useMe();

  const [
    virusTotalNumExp,
    isVirusTotalNumExpPending
  ] = NumExpStats.useVirusTotal();
  const [
    varNumExpLookup,
    isVarNumExpLookupPending
  ] = NumExpStats.useVar();
  const [
    isoAggNumExpLookup,
    isIsoAggNumExpLookupPending
  ] = NumExpStats.useIsoAgg();
  const [
    posNumExpLookup,
    isPosNumExpLookupPending
  ] = NumExpStats.usePos();

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
    isIsoAggsPending ||
    isPositionsPending ||
    isVirusTotalNumExpPending ||
    isVarNumExpLookupPending ||
    isIsoAggNumExpLookupPending ||
    isPosNumExpLookupPending ||
    isInVitroMutsPending ||
    isInVivoMutsPending ||
    isDMSMutsPending
  );

  const [
    finalVirusTotalNumExp,
    finalVarNumExpLookup,
    finalIsoAggNumExpLookup,
    finalPosNumExpLookup
  ] = React.useMemo(() => {
    let finalVirusTotalNumExp = virusTotalNumExp;
    const finalVarNumExpLookup = {...varNumExpLookup};
    const finalIsoAggNumExpLookup = {...isoAggNumExpLookup};
    const finalPosNumExpLookup = {...posNumExpLookup};

    for (const {varNames, isoAggkeys, genePos, count} of [
      ...numInVitroMuts,
      ...numInVivoMuts,
      ...numDMSMuts
    ]) {
      finalVirusTotalNumExp += count;
      for (const varName of varNames) {
        finalVarNumExpLookup[varName] = finalVarNumExpLookup[varName] || 0;
        finalVarNumExpLookup[varName] += count;
      }
      for (const isoAggkey of isoAggkeys) {
        finalIsoAggNumExpLookup[isoAggkey] =
          finalIsoAggNumExpLookup[isoAggkey] || 0;
        finalIsoAggNumExpLookup[isoAggkey] += count;
      }
      if (genePos) {
        finalPosNumExpLookup[genePos] = finalPosNumExpLookup[genePos] || 0;
        finalPosNumExpLookup[genePos] += count;
      }
    }
    return [
      finalVirusTotalNumExp,
      finalVarNumExpLookup,
      finalIsoAggNumExpLookup,
      finalPosNumExpLookup
    ];
  }, [
    isoAggNumExpLookup,
    numInVitroMuts,
    numInVivoMuts,
    numDMSMuts,
    posNumExpLookup,
    varNumExpLookup,
    virusTotalNumExp
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
          }] : []),
          ...(paramIsoAggKey ? [{
            key: paramIsoAggKey,
            text: paramIsoAggKey,
            value: paramIsoAggKey
          }] : []),
          ...(paramGenePos ? [{
            key: paramGenePos,
            text: paramGenePos,
            value: paramGenePos
          }] : [])
        ];
      }
      else {
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

        const displayIsolateAggs = isolateAggs
          .filter(
            ({varName, isoType}) => (
              varName === null ||
              isoType === 'indiv-mut'
            )
          )
          .map(
            ({isoAggkey, isoAggDisplay, mutations, isoType}) => ({
              isoAggkey,
              isoAggDisplay,
              isoType,
              gene: mutations[0]?.gene,
              position: mutations[0]?.position,
              aa: mutations[0]?.aminoAcid,
              numExp: finalIsoAggNumExpLookup[isoAggkey] || 0
            })
          )
          .filter(({isoAggkey, numExp}) => (
            isoAggkey === paramIsoAggKey ||
            numExp > 0
          ))
          .sort(compareIsolateAggs);

        const positionMutCount = displayIsolateAggs
          .filter(({isoType, aa}) => (
            isoType === 'indiv-mut' &&
            aa !== 'del'
          ))
          .reduce((acc, {gene, position}) => {
            const key = `${gene}:${position}`;
            acc[key] = acc[key] || 0;
            acc[key] ++;
            return acc;
          }, {});

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
              finalVirusTotalNumExp,
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
            ...[
              ...positions
                .filter(({posKey}) => (
                  posKey === paramGenePos ||
                  positionMutCount[posKey] > 1
                ))
                .map(
                  ({posKey, gene, position, refAminoAcid}) => ({
                    key: posKey,
                    text: `${
                      gene === 'S' ? '' : `${gene}:`
                    }${refAminoAcid}${position} - any`,
                    value: posKey,
                    type: 'position',
                    position,
                    description: pluralize(
                      'result',
                      finalPosNumExpLookup[posKey],
                      true
                    )
                  })
                ),
              ...displayIsolateAggs
                .map(
                  ({isoAggkey, isoAggDisplay, position, numExp}) => ({
                    key: isoAggkey,
                    text: isoAggDisplay,
                    value: isoAggkey,
                    type: 'mutations',
                    position,
                    description: pluralize('result', numExp, true)
                  })
                )
            ].sort((a, b) => a.position - b.position)
          ] : [])
        ];
      }
    },
    [
      isPending,
      paramVarName,
      paramIsoAggKey,
      paramGenePos,
      variants,
      isolateAggs,
      formOnly,
      finalVirusTotalNumExp,
      positions,
      finalVarNumExpLookup,
      finalIsoAggNumExpLookup,
      finalPosNumExpLookup
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
