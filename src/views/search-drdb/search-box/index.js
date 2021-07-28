import useArticleDropdown from './use-article-dropdown';
import useVariantDropdown from './use-variant-dropdown';
import useRxDropdown from './use-rx-dropdown';

export default function SearchBox({
  loaded,
  formOnly,
  articleValue,
  antibodyValue,
  vaccineValue,
  convPlasmaValue,
  variantValue,
  articles,
  antibodies,
  vaccines,
  cpSuscResultCount,
  variants,
  isolates,
  mutations,
  mutationText,
  onChange,
  children
}) {
  const articleDropdown = useArticleDropdown({
    loaded,
    articleValue,
    antibodyValue,
    vaccineValue,
    convPlasmaValue,
    variantValue,
    mutationText,
    articles,
    onChange,
    formOnly
  });
  const rxDropdown = useRxDropdown({
    loaded, formOnly,
    vaccineValue, antibodyValue,
    convPlasmaValue,
    vaccines, antibodies,
    cpSuscResultCount,
    onChange
  });
  const variantDropdown = useVariantDropdown({
    loaded,
    variantValue,
    mutations,
    mutationText,
    variants,
    isolates,
    onChange,
    formOnly
  });

  return children({
    articleDropdown,
    rxDropdown,
    variantDropdown
  });

}
