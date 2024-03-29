import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import escapeRegExp from 'lodash/escapeRegExp';
import {NumExpStats} from '../hooks/susc-summary';
import LocationParams from '../hooks/location-params';
import IsolateAggs, {compareIsolateAggs} from '../hooks/isolate-aggs';
import Positions from '../hooks/positions';
import DMSMutations from '../hooks/dms-mutations';

import useOnChangeWithLoading from './use-on-change-with-loading';
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


export default function useMutationDropdown() {

  const {
    params: {
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
    isoAggNumExpLookup,
    isIsoAggNumExpLookupPending
  ] = NumExpStats.useIsoAgg();
  const [
    posNumExpLookup,
    isPosNumExpLookupPending
  ] = NumExpStats.usePos();

  const [
    numDMSMuts,
    isDMSMutsPending
  ] = DMSMutations.useSummaryByVirus();

  const isPending = (
    isIsoAggsPending ||
    isPositionsPending ||
    isIsoAggNumExpLookupPending ||
    isPosNumExpLookupPending ||
    isDMSMutsPending
  );

  const [
    finalIsoAggNumExpLookup,
    finalPosNumExpLookup
  ] = React.useMemo(() => {
    const finalIsoAggNumExpLookup = {...isoAggNumExpLookup};
    const finalPosNumExpLookup = {...posNumExpLookup};

    for (const {isoAggkeys, genePos, count} of [
      ...numDMSMuts
    ]) {
      finalIsoAggNumExpLookup[ANY] += count;
      finalPosNumExpLookup[ANY] += count;
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
      finalIsoAggNumExpLookup,
      finalPosNumExpLookup
    ];
  }, [
    isoAggNumExpLookup,
    numDMSMuts,
    posNumExpLookup
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

        const displayPositions = positions
          .map(pos => ({
            ...pos,
            numExp: finalPosNumExpLookup[pos.posKey] || 0
          }))
          .filter(({posKey, numExp}) => (
            posKey === paramGenePos ||
            numExp > 1
          ));

        const hasAtLeastOne = displayIsolateAggs.some(
          ({numExp}) => numExp > 0
        ) || displayPositions.some(
          ({numExp}) => numExp > 0
        );

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
               n={
                 hasAtLeastOne ?
                   finalPosNumExpLookup[ANY] : (
                     paramIsoAggKey || paramGenePos ? null : 0
                   )
               } />
            )
          },
          ...(displayPositions.length + displayIsolateAggs.length > 0 ? [
            {
              key: 'combomut-divider',
              as: FragmentWithoutWarning,
              children: <Dropdown.Divider />
            },
            ...[
              ...displayPositions
                .map(
                  ({posKey, gene, position, refAminoAcid, numExp}) => ({
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
                       n={numExp} />
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
      paramIsoAggKey,
      paramGenePos,
      isolateAggs,
      formOnly,
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

  const containerRef = React.useRef();

  const handleChangeWithLoading = useOnChangeWithLoading(
    handleChange,
    containerRef
  );

  const defaultValue = formOnly ? EMPTY : ANY;

  return (
    <div
     ref={containerRef}
     data-loading={isPending ? '' : undefined}
     className={style['search-box-dropdown-container']}>
      <Dropdown
       search={orderedSearch}
       direction="right"
       placeholder={EMPTY_TEXT}
       options={variantOptions}
       onChange={handleChangeWithLoading}
       value={
         paramIsoAggKey ||
         paramGenePos ||
         defaultValue
        } />
    </div>
  );
}
