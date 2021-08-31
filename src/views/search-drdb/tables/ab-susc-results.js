import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';

import SuscResults from '../hooks/susc-results';
import LocationParams from '../hooks/location-params';

const INDIV_MUT_INDIV_FOLD_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'abNames',
  'controlIsoName',
  'isoName',
  'potency',
  'fold'
];

const INDIV_MUT_INDIV_FOLD_LABELS = {
  isoName: 'Mutation',
  potency: 'IC50 (ng/ml)',
  fold: 'Fold Reduction'
};

const INDIV_MUT_AGG_FOLD_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'abNames',
  'controlIsoName',
  'isoName',
  'cumulativeCount',
  'potency',
  'fold'
];

const INDIV_MUT_AGG_FOLD_LABELS = {
  isoName: 'Mutation',
  potency: 'Mean/Median IC50 (ng/ml)',
  fold: 'Mean/Median Fold Reduction'
};

const COMBO_MUTS_INDIV_FOLD_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'abNames',
  'controlIsoName',
  'isoName',
  'potency',
  'fold'
];

const COMBO_MUTS_INDIV_FOLD_LABELS = {
  isoName: 'Variant',
  potency: 'IC50 (ng/ml)',
  fold: 'Fold Reduction'
};

const COMBO_MUTS_AGG_FOLD_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'controlIsoName',
  'abNames',
  'controlIsoName',
  'isoName',
  'cumulativeCount',
  'potency',
  'fold'
];

const COMBO_MUTS_AGG_FOLD_LABELS = {
  isoName: 'Variant',
  potency: 'Mean/Median IC50 (ng/ml)',
  fold: 'Mean/Median Fold Reduction'
};


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

  const indivMutIndivFoldColumnDefs = useColumnDefs({
    columns: INDIV_MUT_INDIV_FOLD_COLUMNS,
    labels: INDIV_MUT_INDIV_FOLD_LABELS
  });
  const indivMutAggFoldColumnDefs = useColumnDefs({
    columns: INDIV_MUT_AGG_FOLD_COLUMNS,
    labels: INDIV_MUT_AGG_FOLD_LABELS
  });

  const comboMutsIndivFoldColumnDefs = useColumnDefs({
    columns: COMBO_MUTS_INDIV_FOLD_COLUMNS,
    labels: COMBO_MUTS_INDIV_FOLD_LABELS
  });

  const comboMutsAggFoldColumnDefs = useColumnDefs({
    columns: COMBO_MUTS_AGG_FOLD_COLUMNS,
    labels: COMBO_MUTS_AGG_FOLD_LABELS
  });

  return useRenderSuscResults({
    loaded: !isPending,
    id: 'mab-susc-results',
    cacheKey,
    hideNN: true,
    suscResults,
    indivMutIndivFoldColumnDefs,
    indivMutAggFoldColumnDefs,
    comboMutsIndivFoldColumnDefs,
    comboMutsAggFoldColumnDefs
  });
}
