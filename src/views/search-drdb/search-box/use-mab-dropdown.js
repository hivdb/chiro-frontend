import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import uniq from 'lodash/uniq';
import escapeRegExp from 'lodash/escapeRegExp';

import useConfig from '../hooks/use-config';
import Antibodies from '../hooks/antibodies';
import {NumExpStats} from '../hooks/susc-summary';
import DMSMutations from '../hooks/dms-mutations';
import LocationParams from '../hooks/location-params';
import {csvJoin} from '../hooks/susc-summary/funcs';

import useOnChangeWithLoading from './use-on-change-with-loading';
import Desc from './desc';
import FragmentWithoutWarning from './fragment-without-warning';
import style from './style.module.scss';


const EMPTY = 'empty';
const ANY = 'any';
const AB_ANY = 'ab-any';
const AB_APPROVED = 'ab-approved';
const EMPTY_TEXT = 'Select item';
const CP = 'cp';
const ANTIBODY = 'antibodies';
const VACCINE = 'vaccine';


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


export default function useMAbDropdown() {
  const {
    config,
    isPending: isConfigPending
  } = useConfig();

  const {
    antibodies,
    antibodyLookup,
    isPending: isAntibodiesPending
  } = Antibodies.useAll();

  const [abNumExpLookup, isAbNumExpPending] = NumExpStats.useAb('antibody:any');

  const {
    params: {
      refName: paramRefName,
      abNames: paramAbNames,
      formOnly
    },
    onChange
  } = LocationParams.useMe();

  const [
    numDMSMuts,
    isDMSMutsPending
  ] = DMSMutations.useSummaryByRx();

  const isPending = (
    isConfigPending ||
    isAntibodiesPending ||
    isAbNumExpPending ||
    isDMSMutsPending
  );

  const finalAbNumExpLookup = React.useMemo(
    () => {
      if (isPending) {
        return [0, {}];
      }
      const {antibodyCombinations} = config;
      const finalAbNumExpLookup = {...abNumExpLookup};
      for (const {abNames, count} of [
        ...numDMSMuts
      ]) {
        finalAbNumExpLookup[ANY] += count;
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
          finalAbNumExpLookup[AB_ANY] += count;
        }

      }
      finalAbNumExpLookup[AB_APPROVED] = 0;
      for (const [abNamesText, count] of Object.entries(finalAbNumExpLookup)) {
        const abNames = abNamesText.split(',');
        if (abNames.some(abName => antibodyLookup[abName]?.isApproved)) {
          finalAbNumExpLookup[AB_APPROVED] += count;
        }
      }

      return finalAbNumExpLookup;
    },
    [
      isPending,
      config,
      abNumExpLookup,
      antibodyLookup,
      numDMSMuts
    ]
  );

  const activeRx = React.useMemo(
    () => {
      const defaultValue = formOnly ? EMPTY : ANY;

      let activeRx = defaultValue;
      if (paramAbNames && paramAbNames[0] === 'any') {
        activeRx = AB_ANY;
      }
      if (paramAbNames && paramAbNames[0] === 'approved') {
        activeRx = AB_APPROVED;
      }
      else if (paramAbNames && paramAbNames.length > 0) {
        activeRx = csvJoin(paramAbNames);
      }
      return activeRx;
    },
    [formOnly, paramAbNames]
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
          {
            key: AB_ANY,
            text: 'Any mAb',
            value: AB_ANY,
            type: ANTIBODY
          },
          {
            key: AB_APPROVED,
            text: 'Approved mAb',
            value: AB_APPROVED,
            type: ANTIBODY
          },
          ...(
            (
              activeRx !== EMPTY &&
              activeRx !== ANY &&
              activeRx !== AB_APPROVED &&
              activeRx !== AB_ANY
            ) ?
              [{
                key: activeRx,
                text: paramAbNames.join(' + '),
                value: activeRx,
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
            description: <Desc n={
              finalAbNumExpLookup[AB_ANY] ?
                finalAbNumExpLookup[ANY] : (
                  activeRx === EMPTY || activeRx === ANY ? 0 : null
                )
            } />
          },
          ...(
            (
              (activeRx !== EMPTY && activeRx !== ANY) ||
              finalAbNumExpLookup[AB_ANY] > 0
            ) ?
              [
                {
                  key: 'antibody-divider',
                  as: FragmentWithoutWarning,
                  children: <Dropdown.Divider />
                },
                {
                  key: AB_ANY,
                  text: 'Any mAb',
                  value: AB_ANY,
                  type: ANTIBODY,
                  description: <Desc n={finalAbNumExpLookup[AB_ANY] || 0} />
                },
                {
                  key: AB_APPROVED,
                  text: 'Approved mAb',
                  value: AB_APPROVED,
                  type: ANTIBODY,
                  description: (
                    <Desc n={finalAbNumExpLookup[AB_APPROVED] || 0} />
                  )
                },
                ...[
                  ...antibodyCombinations
                    .map(abNames => {
                      const textAbNames = csvJoin(abNames);

                      return {
                        key: textAbNames,
                        text: abNames.join(' + '),
                        value: textAbNames,
                        type: ANTIBODY,
                        description: (
                          <Desc
                           n={finalAbNumExpLookup[textAbNames] || 0} />
                        ),
                        'data-num-results': finalAbNumExpLookup[textAbNames],
                        'data-is-empty': (
                          textAbNames !== activeRx &&
                      !finalAbNumExpLookup[textAbNames]
                        ),
                        synonyms: []
                      };
                    }),
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
                        description: (
                          <Desc n={finalAbNumExpLookup[abName] || 0} />
                        ),
                        'data-num-results': finalAbNumExpLookup[abName],
                        'data-is-empty': (
                          abName !== activeRx &&
                      !finalAbNumExpLookup[abName]
                        ),
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
      activeRx,
      paramRefName,
      paramAbNames,
      config,
      formOnly,
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
          clear[VACCINE] = undefined;
          clear[CP] = undefined;
          clear[ANTIBODY] = undefined;
          onChange(clear);
        }
        else if (value === AB_ANY) {
          onChange(ANTIBODY, 'any');
        }
        else if (value === AB_APPROVED) {
          onChange(ANTIBODY, 'approved');
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

  return (
    <div
     ref={containerRef}
     data-loading={isPending ? '' : undefined}
     className={style['search-box-dropdown-container']}>
      <Dropdown
       direction="right"
       search={rxSearch}
       options={options}
       placeholder={EMPTY_TEXT}
       onChange={handleChangeWithLoading}
       value={activeRx} />
    </div>
  );
}
