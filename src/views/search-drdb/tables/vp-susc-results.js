import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';


export default function VPSuscResults({
  loaded,
  cacheKey,
  articleLookup,
  variantLookup,
  vpSuscResults
}) {

  const indivMutColumnDefs = useColumnDefs({
    articleLookup,
    variantLookup,
    columns: [
      'refName',
      'section',
      'controlVariantName',
      'variantName',
      'vaccineName',
      'timing',
      'dosage',
      'fold',
      'resistanceLevel'
    ],
    labels: {
      variantName: 'Mutation'
    }
  });

  const comboMutsColumnDefs = useColumnDefs({
    articleLookup,
    variantLookup,
    columns: [
      'refName',
      'section',
      'controlVariantName',
      'variantName',
      'vaccineName',
      'timing',
      'dosage',
      'fold',
      'resistanceLevel'
    ],
    labels: {
      variantName: 'Variant'
    }
  });

  return useRenderSuscResults({
    loaded,
    id: 'vp-susc-results',
    cacheKey,
    suscResults: vpSuscResults,
    variantLookup,
    indivMutColumnDefs,
    comboMutsColumnDefs
  });
}
