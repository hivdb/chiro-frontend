import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import escapeRegExp from 'lodash/escapeRegExp';
import LocationParams from '../../hooks/location-params';
import IsolateAggs, {compareIsolateAggs} from '../../hooks/isolate-aggs';
import Positions from '../../hooks/positions';
import InVivoMutations from '../../hooks/invivo-mutations';

import Desc from './desc';
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
      // abNames: paramAbNames,
      varName: paramVarName,
      isoAggkey: paramIsoAggKey,
      genePos: paramGenePos,
      formOnly
    },
    onChange
  } = LocationParams.useMe();

  const {
    isolateAggs,
    isPending: isIsoAggsPending
  } = IsolateAggs.useMe();

  const {
    positions,
    isPending: isPositionsPending
  } = Positions.useMe();

  const [
    numInVivoMuts,
    isInVivoMutsPending
  ] = InVivoMutations.useSummaryByVirus();

  const isPending = (
    isIsoAggsPending ||
    isPositionsPending ||
    isInVivoMutsPending
  );

  const [
    finalVirusTotalNumExp,
    finalIsoAggNumExpLookup,
    finalPosNumExpLookup
  ] = React.useMemo(() => {
    let finalVirusTotalNumExp = 0;
    const finalIsoAggNumExpLookup = {};
    const finalPosNumExpLookup = {};

    for (const {isoAggkeys, genePos, count} of numInVivoMuts) {
      finalVirusTotalNumExp += count;
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
      finalIsoAggNumExpLookup,
      finalPosNumExpLookup
    ];
  }, [numInVivoMuts]);

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
        const approx = false; // paramAbNames && paramAbNames.length > 1;

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
            description: (
              <Desc
               approx={approx}
               n={finalVirusTotalNumExp} />
            )
          },
          ...(displayIsolateAggs.length > 0 ? [
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
                    description: (
                      <Desc
                       approx={approx}
                       n={finalPosNumExpLookup[posKey]} />
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
                    description: (
                      <Desc
                       approx={approx}
                       n={numExp} />
                    )
                  })
                )
            ].sort((a, b) => a.position - b.position)
          ] : [])
        ];
      }
    },
    [
      isPending,
      // paramAbNames,
      paramVarName,
      paramIsoAggKey,
      paramGenePos,
      isolateAggs,
      formOnly,
      finalVirusTotalNumExp,
      positions,
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
