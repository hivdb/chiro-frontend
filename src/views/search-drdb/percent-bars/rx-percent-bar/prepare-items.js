import uniq from 'lodash/uniq';
import {csvStringify, csvParse} from 'sierra-frontend/dist/utils/csv';

import style from '../style.module.scss';
import {groupSmallSlices} from '../funcs';

import {
  TYPE_INFVAR,
  TYPE_VACCINE,
  TYPE_MAB,
  TYPE_MAB_INDIV,
  TYPE_OTHER
} from '../types';


export default function prepareItems({
  paramAbNames,
  vaccines,
  antibodyLookup,
  infVariants,
  vaccNumExpLookup,
  abNumExpLookup,
  orderedAbNames,
  infVarNumExpLookup
}) {
  let expAntibodies;

  if (
    paramAbNames &&
    paramAbNames.length > 0 &&
    !paramAbNames.includes('any')
  ) {
    expAntibodies = paramAbNames;
  }
  else {
    expAntibodies = uniq(
      Object.keys(abNumExpLookup)
        .filter(ab => ab !== '__ANY')
        .reduce((acc, abNames) => [...acc, ...csvParse(abNames, false)[0]], [])
    );
  }

  const presentVariants = [
    ...infVariants
      .filter(({varName}) => varName in infVarNumExpLookup)
      .map(({varName, synonyms}) => ({
        name: varName,
        type: TYPE_INFVAR,
        shortDisplay: <>{varName} infection</>,
        fullDisplay: <>
          Convalescent plasma from <strong>{varName}</strong>{' '}
          {synonyms.length > 0 ? <>
            <span className={style['title-supplement']}>
              ({synonyms.join('; ')})
            </span>{' '}
          </> : null}
          infected person
        </>,
        numExp: infVarNumExpLookup[varName]
      })),
    ...vaccines
      .filter(({vaccineName}) => vaccineName in vaccNumExpLookup)
      .map(({vaccineName}) => ({
        name: vaccineName,
        type: TYPE_VACCINE,
        shortDisplay: vaccineName,
        fullDisplay: <>
          <strong>{vaccineName}</strong> vaccinee plasma
        </>,
        displayExtra: null,
        numExp: vaccNumExpLookup[vaccineName]
      })),
    ...(abNumExpLookup.__ANY > 0 ? [{
      name: csvStringify(expAntibodies),
      type: TYPE_MAB,
      shortDisplay: expAntibodies.length > 0 && expAntibodies.length < 5 ?
        expAntibodies
          .map(
            abName => {
              const {abbreviationName} = antibodyLookup[abName];
              return abbreviationName || abName;
            }
          )
          .join('/') : 'MAbs',
      fullDisplay: expAntibodies.length > 0 && expAntibodies.length < 5 ?
        expAntibodies
          .join('/') : 'Monoclonal antibodies',
      subItems: orderedAbNames
        .map(
          abNamesArr => {
            const abNamesText = csvStringify(abNamesArr);
            const numExp = abNumExpLookup[abNamesText];
            const abObjs = abNamesArr
              .map(ab => antibodyLookup[ab]);
            return {
              name: abNamesText,
              type: TYPE_MAB_INDIV,
              shortDisplay: abObjs
                .map(({abName, abbreviationName}) => abbreviationName || abName)
                .join(' + '),
              fullDisplay: abObjs
                .map(({abName}) => abName)
                .join(' + '),
              displayExtra: null,
              numExp
            };
          }
        ),
      numExp: abNumExpLookup.__ANY
    }] : [])
  ];
  presentVariants.sort(
    (r1, r2) => {
      let cmp = r2.numExp - r1.numExp; // desc
      if (cmp === 0) {
        cmp = r1.type - r2.type; // asc
      }
      return cmp;
    }
  );
  const groupItems = {};
  groupItems[TYPE_INFVAR] = {
    name: 'Other infections',
    type: TYPE_OTHER,
    shortDisplay: 'Other CPs',
    fullDisplay: 'Convalescent plasma from other variant infected person'
  };
  groupItems[TYPE_VACCINE] = {
    name: 'Other vaccines',
    type: TYPE_OTHER,
    shortDisplay: 'Other VPs',
    fullDisplay: 'Other vaccinee plasma'
  };
  const maxNumItems = {};
  maxNumItems[TYPE_INFVAR] = 3;
  maxNumItems[TYPE_VACCINE] = 3;
  maxNumItems[TYPE_MAB] = 1;
  return groupSmallSlices(
    presentVariants,
    'numExp',
    groupItems,
    maxNumItems,
    true
  );
}
