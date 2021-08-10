import {SuscSummaryProvider} from './context';
import useAntibodySuscSummary from './use-antibody-susc-summary';
import useAntibodyNumExp from './use-antibody-numexp';
import useArticleNumExp from './use-article-numexp';
import useInfectedVariantNumExp from './use-infected-variant-numexp';
import useVaccineNumExp from './use-vaccine-numexp';
import useIsoAggNumExp from './use-isolate-agg-numexp';
import useIsolateNumExp from './use-isolate-numexp';
import useVariantNumExp from './use-variant-numexp';
import useRxTotalNumExp from './use-rx-total-numexp';
import useVirusTotalNumExp from './use-virus-total-numexp';

const NumExpStats = {
  useRxTotal: useRxTotalNumExp,
  useVirusTotal: useVirusTotalNumExp,
  useRef: useArticleNumExp,
  useAb: useAntibodyNumExp,
  useInfVar: useInfectedVariantNumExp,
  useVacc: useVaccineNumExp,
  useIsoAgg: useIsoAggNumExp,
  useVar: useVariantNumExp,
  useIso: useIsolateNumExp
};

const SuscSummary = {
  Provider: SuscSummaryProvider,
  useAb: useAntibodySuscSummary
};

export {NumExpStats};

export default SuscSummary;
