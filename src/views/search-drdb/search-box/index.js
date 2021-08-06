import React from 'react';
import PropTypes from 'prop-types';
import useArticleDropdown from './use-article-dropdown';
import useVariantDropdown from './use-variant-dropdown';
import useRxDropdown from './use-rx-dropdown';

SearchBox.propTypes = {
  loaded: PropTypes.bool.isRequired,
  isolateAggs: PropTypes.array,
  children: PropTypes.func
};

SearchBox.defaultProps = {
  loaded: false
};

export default function SearchBox({
  loaded,
  isolateAggs,
  children
}) {

  const articleDropdown = useArticleDropdown({loaded});
  const rxDropdown = useRxDropdown({loaded});
  const variantDropdown = useVariantDropdown({
    loaded,
    isolateAggs
  });

  return <>
    {children({
      articleDropdown,
      rxDropdown,
      variantDropdown
    })}</>;

}
