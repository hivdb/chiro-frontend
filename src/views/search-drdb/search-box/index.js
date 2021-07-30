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
  infectedVariants,
  variants,
  isolateAggs,
  mutationText,
  onChange,
  children
}) {
  const commonProps = {
    articleValue,
    antibodyValue,
    vaccineValue,
    convPlasmaValue,
    variantValue,
    mutationText
  };

  const articleDropdown = useArticleDropdown({
    loaded,
    ...commonProps,
    articles,
    onChange,
    formOnly
  });
  const rxDropdown = useRxDropdown({
    loaded,
    ...commonProps,
    vaccines,
    antibodies,
    infectedVariants,
    onChange,
    formOnly
  });
  const variantDropdown = useVariantDropdown({
    loaded,
    ...commonProps,
    variants,
    isolateAggs,
    onChange,
    formOnly
  });

  return children({
    articleDropdown,
    rxDropdown,
    variantDropdown
  });

}
