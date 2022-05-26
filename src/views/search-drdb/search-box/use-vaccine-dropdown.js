import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import escapeRegExp from 'lodash/escapeRegExp';

import Vaccines from '../hooks/vaccines';
import {NumExpStats} from '../hooks/susc-summary';
import LocationParams from '../hooks/location-params';

import useOnChangeWithLoading from './use-on-change-with-loading';
import Desc from './desc';
import FragmentWithoutWarning from './fragment-without-warning';
import style from './style.module.scss';


const EMPTY = 'empty';
const ANY = 'any';
const VP_ANY = 'vp-any';
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


export default function useVaccineDropdown() {
  const [includeAll, setIncludeAll] = React.useState(false);
  const onSearchChange = React.useCallback(
    (event, {searchQuery}) => {
      setIncludeAll(searchQuery !== '');
    },
    [setIncludeAll]
  );
  const {
    vaccines,
    isPending: isVaccinesPending
  } = Vaccines.useAll();

  const [vaccNumExpLookup, isVaccNumExpPending] = NumExpStats.useVacc();

  const {
    params: {
      vaccineName: paramVaccineName,
      formOnly
    },
    onChange
  } = LocationParams.useMe();

  const isPending = (
    isVaccinesPending ||
    isVaccNumExpPending
  );

  const activeRx = React.useMemo(
    () => {
      const defaultValue = formOnly ? EMPTY : ANY;
      let activeRx = defaultValue;
      if (paramVaccineName === 'any') {
        activeRx = VP_ANY;
      }
      else if (paramVaccineName) {
        activeRx = paramVaccineName;
      }
      return activeRx;
    },
    [formOnly, paramVaccineName]
  );

  const options = React.useMemo(
    () => {
      if (isPending) {
        return [
          {
            key: ANY,
            text: 'Any',
            value: ANY
          },
          {
            key: VP_ANY,
            text: 'Any VP',
            value: VP_ANY,
            type: VACCINE
          },
          ...(
            (
              activeRx !== EMPTY &&
              activeRx !== ANY &&
              activeRx !== VP_ANY
            ) ?
              [{
                key: activeRx,
                text: activeRx,
                value: activeRx,
                type: VACCINE
              }] : [])
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
            key: ANY,
            text: 'Any',
            value: ANY,
            description: <Desc n={
              vaccNumExpLookup[VP_ANY] ?
                vaccNumExpLookup[ANY] : (
                  activeRx === EMPTY || activeRx === ANY ? 0 : null
                )
            } />
          },
          ...(
            (
              (activeRx !== EMPTY && activeRx !== ANY) ||
              vaccNumExpLookup[VP_ANY] > 0
            ) ?
              [
                {
                  key: 'vaccine-divider',
                  as: FragmentWithoutWarning,
                  children: <Dropdown.Divider />
                },
                {
                  key: VP_ANY,
                  text: 'Any VP',
                  value: VP_ANY,
                  type: VACCINE,
                  description: <Desc n={vaccNumExpLookup[VP_ANY] || 0} />
                },
                ...vaccines
                  .filter(({vaccineName}) => (
                    includeAll ||
                vaccineName === activeRx ||
                !(/\+/.test(vaccineName))
                  ))
                  .map(
                    ({vaccineName}) => ({
                      key: vaccineName,
                      text: vaccineName,
                      value: vaccineName,
                      description: (
                        <Desc n={vaccNumExpLookup[vaccineName] || 0} />
                      ),
                      'data-num-exp': vaccNumExpLookup[vaccineName] || 0,
                      'data-is-empty': (
                        vaccineName !== activeRx &&
                        !vaccNumExpLookup[vaccineName]
                      ),
                      type: VACCINE
                    })
                  )
                  .filter(v => !v['data-is-empty'])
                  .sort((a, b) => b['data-num-exp'] - a['data-num-exp'])
              ] : [])
        ];
      }
    },
    [
      isPending,
      activeRx,
      formOnly,
      vaccNumExpLookup,
      vaccines,
      includeAll
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
        else if (value === VP_ANY) {
          onChange(VACCINE, 'any');
        }
        else {
          const {type} = options.find(opt => opt.value === value);
          onChange(type, value);
        }
        setIncludeAll(false);
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
       onSearchChange={onSearchChange}
       value={activeRx} />
    </div>
  );
}
