import React from 'react';
import PropTypes from 'prop-types';
import useArticleDropdown from './use-article-dropdown';
import useVariantDropdown from './use-variant-dropdown';
import useRxDropdown from './use-rx-dropdown';

SearchBox.propTypes = {
  children: PropTypes.func
};

export default function SearchBox({children}) {

  const articleDropdown = useArticleDropdown();
  const rxDropdown = useRxDropdown();
  const variantDropdown = useVariantDropdown();

  return <>
    {children({
      articleDropdown,
      rxDropdown,
      variantDropdown
    })}</>;

}
