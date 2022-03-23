import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import uniq from 'lodash/uniq';
import escapeRegExp from 'lodash/escapeRegExp';

import useConfig from '../../hooks/use-config';
import Antibodies from '../../hooks/antibodies';
import InVivoMutations from '../../hooks/invivo-mutations';
import InVitroMutations from '../../hooks/invitro-mutations';
import LocationParams from '../../hooks/location-params';

import Desc from './desc';
// import FragmentWithoutWarning from './fragment-without-warning';
import style from './style.module.scss';


const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';
const NAIVE = 'naive';
const CP = 'cp';
const ANTIBODY = 'antibodies';


function rxSearch(options, query) {
  if (query === '') {
    return options;
  }
  const re = new RegExp(escapeRegExp(query), 'i');
  return options.filter(rx => (
    rx.value && (
      re.test(rx.text) ||
      re.test(rx.value) ||
      (rx.synonyms && rx.synonyms.some(syn => re.test(syn)))
    )
  ));
}


export default function useRxDropdown() {
  const {
    config,
    isPending: isConfigPending
  } = useConfig();

  const {
    antibodies,
    isPending: isAntibodiesPending
  } = Antibodies.useAll();

  const {
    params: {
      naive: paramNaive,
      refName: paramRefName,
      infectedVarName: paramInfectedVarName,
      abNames: paramAbNames,
      formOnly
    },
    onChange
  } = LocationParams.useMe();

  const [
    numInVivoMuts,
    isInVivoMutsPending
  ] = InVivoMutations.useSummaryByRx();
  const [
    numInVitroMuts,
    isInVitroMutsPending
  ] = InVitroMutations.useSummaryByRx();

  const isPending = (
    isConfigPending ||
    isAntibodiesPending ||
    isInVivoMutsPending ||
    isInVitroMutsPending
  );

  const [
    finalRxTotalNumExp,
    finalAbNumExpLookup
    // totalInfVarNumExp,
    // totalNaiveRxNumExp
  ] = React.useMemo(
    () => {
      if (isPending) {
        return [0, {}, {}, {}];
      }
      const {antibodyCombinations} = config;
      let finalRxTotalNumExp = 0;
      let totalInfVarNumExp = 0;
      let totalNaiveRxNumExp = 0;
      const finalAbNumExpLookup = {};
      finalAbNumExpLookup[ANY] = 0;
      for (const {abNames, infectedVarNames, count} of [
        ...numInVivoMuts,
        ...numInVitroMuts
      ]) {
        finalRxTotalNumExp += count;
        const countedMulAb = {};

        for (const abName of abNames) {
          finalAbNumExpLookup[abName] = finalAbNumExpLookup[abName] || 0;
          finalAbNumExpLookup[abName] += count;

          for (const mulAb of antibodyCombinations) {
            const textMulAb = mulAb.join(',');
            if (!(textMulAb in countedMulAb) && mulAb.includes(abName)) {
              // only count once for a combination
              finalAbNumExpLookup[textMulAb] =
                finalAbNumExpLookup[textMulAb] || 0;
              finalAbNumExpLookup[textMulAb] += count;
              countedMulAb[textMulAb] = true;
            }
          }
        }
        if (abNames && abNames.length > 0) {
          finalAbNumExpLookup[ANY] += count;
        }

        if (infectedVarNames && infectedVarNames.length > 0) {
          totalInfVarNumExp += count;
        }

        if (
          (!abNames || abNames.length === 0) &&
          (!infectedVarNames || infectedVarNames.length === 0)
        ) {
          totalNaiveRxNumExp += count;
        }
      }

      return [
        finalRxTotalNumExp,
        finalAbNumExpLookup,
        totalInfVarNumExp,
        totalNaiveRxNumExp
      ];
    },
    [
      isPending,
      config,
      numInVivoMuts,
      numInVitroMuts
    ]
  );

  const options = React.useMemo(
    () => {
      if (isPending) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          /*{
            key: 'naive-any',
            text: <em>Untreated / non-Ab</em>,
            value: 'naive-any',
            type: NAIVE
          },
          {
            key: 'cp-any',
            text: 'Convalescent plasma',
            value: 'cp-any',
            type: CP
          },*/
          {
            key: 'ab-any',
            text: 'MAb - any',
            value: 'ab-any',
            type: ANTIBODY
          },
          ...(
            paramAbNames &&
            paramAbNames.length > 0 &&
            paramAbNames[0] !== 'any' ?
              [{
                key: paramAbNames.join(','),
                text: paramAbNames.join(' + '),
                value: paramAbNames.join(','),
                type: ANTIBODY
              }] : []
          )
        ];
      }
      else {
        const {antibodyCombinations} = config;
        const excludeAbs = uniq(
          antibodyCombinations.reduce(
            (acc, abs) => [...acc, ...abs],
            []
          )
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
            description: <Desc n={finalRxTotalNumExp} />
          },
          /*...(totalNaiveRxNumExp > 0 ? [
            {
              key: 'naive-any',
              text: <em>Untreated / non-Ab</em>,
              value: 'naive-any',
              description: <Desc n={totalNaiveRxNumExp} />,
              type: NAIVE
            }
          ] : []),
          ...(totalInfVarNumExp > 0 ? [
            {
              key: 'cp-any',
              text: 'Convalescent plasma',
              value: 'cp-any',
              description: <Desc n={totalInfVarNumExp} />,
              type: CP
            }
          ] : []),*/
          ...(finalAbNumExpLookup[ANY] > 0 ? [
            /*{
              key: 'antibody-divider',
              as: FragmentWithoutWarning,
              children: <Dropdown.Divider />
            },
            {
              key: 'ab-any',
              text: 'MAb - any',
              value: 'ab-any',
              type: ANTIBODY,
              description: <Desc n={finalAbNumExpLookup[ANY]} />
            },*/
            ...[
              ...antibodyCombinations
                .map(abNames => ({
                  key: abNames.join(','),
                  text: abNames.join(' + '),
                  value: abNames.join(','),
                  type: ANTIBODY,
                  description: (
                    <Desc
                     n={finalAbNumExpLookup[abNames.join(',')] || 0} />
                  ),
                  'data-num-results': finalAbNumExpLookup[abNames.join(',')],
                  'data-is-empty': !finalAbNumExpLookup[abNames.join(',')],
                  synonyms: []
                })),
              ...antibodies
                .filter(({
                  abName,
                  priority
                }) => (
                  !excludeAbs.includes(abName) &&
                  (paramRefName || priority < 4000)
                ))
                .map(
                  ({
                    abName,
                    abbreviationName: abbr,
                    synonyms
                  }) => ({
                    key: abName,
                    text: abbr ? `${abName} (${abbr})` : abName,
                    value: abName,
                    type: ANTIBODY,
                    description: <Desc n={finalAbNumExpLookup[abName] || 0} />,
                    'data-num-results': finalAbNumExpLookup[abName],
                    'data-is-empty': !finalAbNumExpLookup[abName],
                    synonyms
                  })
                )
            ].filter(v => !v['data-is-empty'])
          ] : [])
        ];
      }
    },
    [
      isPending,
      paramRefName,
      paramAbNames,
      config,
      formOnly,
      finalRxTotalNumExp,
      // totalInfVarNumExp,
      // totalNaiveRxNumExp,
      finalAbNumExpLookup,
      antibodies
    ]
  );
  const handleChange = React.useCallback(
    (evt, {value, options}) => {
      if (value === EMPTY) {
        evt.preventDefault();
      }
      else {
        if (value === ANY) {
          const clear = {};
          clear[NAIVE] = undefined;
          clear[CP] = undefined;
          clear[ANTIBODY] = undefined;
          onChange(clear);
        }
        else if (value === 'ab-any') {
          onChange(ANTIBODY, 'any');
        }
        else if (value === 'cp-any') {
          onChange(CP, 'any');
        }
        else if (value === 'naive-any') {
          onChange(NAIVE, 'any');
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

  let activeRx = defaultValue;
  if (paramAbNames && paramAbNames[0] === 'any') {
    activeRx = 'ab-any';
  }
  else if (paramInfectedVarName === 'any') {
    activeRx = 'cp-any';
  }
  else if (paramNaive === 'any') {
    activeRx = 'naive-any';
  }
  else if (paramAbNames && paramAbNames.length > 0) {
    activeRx = paramAbNames.join(',');
  }
  return (
    <div
     data-loaded={!isPending}
     className={style['search-box-dropdown-container']}>
      <Dropdown
       direction="right"
       search={rxSearch}
       options={options}
       placeholder={EMPTY_TEXT}
       onChange={handleChange}
       value={activeRx} />
    </div>
  );
}
