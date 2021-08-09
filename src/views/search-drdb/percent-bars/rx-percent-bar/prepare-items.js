import uniq from 'lodash/uniq';
import {csvStringify, csvParse} from 'sierra-frontend/dist/utils/csv';

import {groupSmallSlices} from '../funcs';

import {
  TYPE_INFVAR,
  TYPE_VACCINE,
  TYPE_MAB,
  TYPE_MAB_INDIV,
  TYPE_OTHER
} from '../types';


export default function prepareItems({
  vaccines,
  antibodyLookup,
  infVariants,
  vaccNumExpLookup,
  abNumExpLookup,
  infVarNumExpLookup
}) {
  const expAntibodies = uniq(
    Object.keys(abNumExpLookup)
      .filter(ab => ab !== '__ANY')
      .reduce((acc, abNames) => [...acc, ...csvParse(abNames, false)[0]], [])
  );

  const presentVariants = [
    ...infVariants
      .filter(({varName}) => varName in infVarNumExpLookup)
      .map(({varName, synonyms}) => ({
        name: varName,
        type: TYPE_INFVAR,
        display: varName,
        displayExtra: synonyms.join('; '),
        displayAfterExtra: ' infection',
        numExp: infVarNumExpLookup[varName]
      })),
    ...vaccines
      .filter(({vaccineName}) => vaccineName in vaccNumExpLookup)
      .map(({vaccineName}) => ({
        name: vaccineName,
        type: TYPE_VACCINE,
        display: vaccineName,
        displayExtra: null,
        numExp: vaccNumExpLookup[vaccineName]
      })),
    ...(abNumExpLookup.__ANY > 0 ? [{
      name: csvStringify(expAntibodies),
      type: TYPE_MAB,
      display: expAntibodies.length > 0 && expAntibodies.length < 5 ?
        expAntibodies
          .map(
            abName => {
              const {abbreviationName} = antibodyLookup[abName];
              return abbreviationName || abName;
            }
          )
          .join('/') : 'Antibodies',
      displayExtra: null,
      subItems: Object.entries(abNumExpLookup)
        .filter(([abNames]) => abNames !== '__ANY')
        .map(
          ([abNames, numExp]) => {
            const abObjs = csvParse(abNames, /* withHeader = */false)[0]
              .filter(ab => ab in antibodyLookup)
              .map(ab => antibodyLookup[ab]);
            return {
              name: abNames,
              type: TYPE_MAB_INDIV,
              display: abObjs
                .map(
                  ({abName, abbreviationName}) => abbreviationName || abName
                )
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
  const results = groupSmallSlices(presentVariants, 'numExp', {
    name: 'Others',
    type: TYPE_OTHER,
    display: 'Others',
    displayExtra: null
  }, 6);
  const otherItem = results[results.length - 1];
  if (otherItem && otherItem.item.type === TYPE_OTHER) {
    otherItem.item.subItems.sort((r1, r2) => r1.type - r2.type);
  }
  return results.sort((r1, r2) => r1.item.type - r2.item.type);
}
