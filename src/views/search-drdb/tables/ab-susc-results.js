import useColumnDefs from './column-defs';
import useRenderSuscResults from './use-render-susc-results';

import SuscResults from '../hooks/susc-results';
import LocationParams from '../hooks/location-params';

const INDIV_MUT_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'abNames',
  'controlVarName',
  'isoAggkey',
  'numStudies',
  'cumulativeCount',
  'potency',
  'fold',
  'dataAvailability'
];

const INDIV_MUT_LABELS = {
  isoAggkey: 'Mutation',
  potency: 'IC50 (ng/ml)',
  fold: 'Fold Reduction'
};

const INDIV_MUT_GROUP_BY = [
  'refName',
  'assayName',
  'abNames',
  'controlVarName',
  'isoAggkey',
  'numMutations',
  'rxType'
];

const COMBO_MUTS_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'abNames',
  'controlVarName',
  'isoAggkey',
  'numStudies',
  'cumulativeCount',
  'potency',
  'fold',
  'dataAvailability'
];

const COMBO_MUTS_LABELS = {
  isoAggkey: 'Variant',
  potency: 'IC50 (ng/ml)',
  fold: 'Fold Reduction'
};

const COMBO_MUTS_GROUP_BY = [
  'refName',
  'assayName',
  'abNames',
  'controlVarName',
  'isoAggkey',
  'numMutations',
  'rxType'
];


export default function AbSuscResults() {
  const {
    params: {
      refName,
      isoAggkey,
      abNames
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, isoAggkey, abNames});

  const {suscResults, isPending} = SuscResults.useAb();

  const indivMutColumnDefs = useColumnDefs({
    columns: INDIV_MUT_COLUMNS,
    labels: INDIV_MUT_LABELS
  });
  const comboMutsColumnDefs = useColumnDefs({
    columns: COMBO_MUTS_COLUMNS,
    labels: COMBO_MUTS_LABELS
  });

  return useRenderSuscResults({
    loaded: !isPending,
    id: 'mab-susc-results',
    cacheKey,
    hideNN: true,
    suscResults,
    indivMutColumnDefs,
    indivMutGroupBy: INDIV_MUT_GROUP_BY,
    indivMutDefaultGroupBy: INDIV_MUT_GROUP_BY, // currently same as GROUP_BY
    comboMutsColumnDefs,
    comboMutsGroupBy: COMBO_MUTS_GROUP_BY,
    comboMutsDefaultGroupBy: COMBO_MUTS_GROUP_BY // currently same as GROUP_BY
  });
}
