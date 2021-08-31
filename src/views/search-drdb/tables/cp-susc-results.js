import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';

import SuscResults from '../hooks/susc-results';
import LocationParams from '../hooks/location-params';

const INDIV_MUT_INDIV_FOLD_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'infectedIsoName',
  'timing',
  // 'severity',
  'controlIsoName',
  'isoName',
  'potency',
  'fold'
];

const INDIV_MUT_INDIV_FOLD_LABELS = {
  isoName: 'Mutation',
  timing: 'Months',
  potency: 'NT50 (Dilution)',
  fold: 'Fold Reduction'
};

const INDIV_MUT_AGG_FOLD_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'infectedIsoName',
  'timing',
  // 'severity',
  'controlIsoName',
  'isoName',
  'cumulativeCount',
  'potency',
  'fold'
];

const INDIV_MUT_AGG_FOLD_LABELS = {
  isoName: 'Mutation',
  timing: 'Months',
  potency: 'Mean/Median NT50 (Dilution)',
  fold: 'Mean/Median Fold Reduction'
};

const COMBO_MUTS_INDIV_FOLD_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'infectedIsoName',
  'timing',
  // 'severity',
  'controlIsoName',
  'isoName',
  'potency',
  'fold'
];

const COMBO_MUTS_INDIV_FOLD_LABELS = {
  isoName: 'Variant',
  timing: 'Months',
  potency: 'NT50 (Dilution)',
  fold: 'Fold Reduction'
};

const COMBO_MUTS_AGG_FOLD_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'infectedIsoName',
  'timing',
  // 'severity',
  'controlIsoName',
  'isoName',
  'cumulativeCount',
  'potency',
  'fold'
];

const COMBO_MUTS_AGG_FOLD_LABELS = {
  isoName: 'Variant',
  timing: 'Months',
  potency: 'Mean/Median NT50 (Dilution)',
  fold: 'Mean/Median Fold Reduction'
};


export default function CPSuscResults() {
  const {
    params: {
      refName,
      isoAggkey
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, isoAggkey});

  const {suscResults, isPending} = SuscResults.useCP();

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
    id: 'cp-susc-results',
    cacheKey,
    suscResults,
    indivMutIndivFoldColumnDefs,
    indivMutAggFoldColumnDefs,
    comboMutsIndivFoldColumnDefs,
    comboMutsAggFoldColumnDefs
  });
}
