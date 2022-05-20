import React from 'react';
import PropTypes from 'prop-types';
import useArticleDropdown from './use-article-dropdown';
import useVariantDropdown from './use-variant-dropdown';
import useMutationDropdown from './use-mutation-dropdown';
import useInfectedVariantDropdown from './use-infected-variant-dropdown';
import useVaccineDropdown from './use-vaccine-dropdown';
import useMAbDropdown from './use-mab-dropdown';

SearchBox.propTypes = {
  children: PropTypes.func
};

export default function SearchBox({children}) {

  const articleDropdown = useArticleDropdown();
  const infectedVariantDropdown = useInfectedVariantDropdown();
  const vaccineDropdown = useVaccineDropdown();
  const mabDropdown = useMAbDropdown();
  const variantDropdown = useVariantDropdown();
  const mutationDropdown = useMutationDropdown();

  return <>
    {children({
      articleDropdown,
      infectedVariantDropdown,
      vaccineDropdown,
      mabDropdown,
      variantDropdown,
      mutationDropdown
    })}
  </>;

}
