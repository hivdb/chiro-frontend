import React from 'react';
import PropTypes from 'prop-types';
import useArticleDropdown from './use-article-dropdown';
import useVirusDropdown from './use-virus-dropdown';
import useRxDropdown from './use-rx-dropdown';

SearchBox.propTypes = {
  children: PropTypes.func
};

export default function SearchBox({children}) {

  const articleDropdown = useArticleDropdown();
  const rxDropdown = useRxDropdown();
  const virusDropdown = useVirusDropdown();

  return <>
    {children({
      articleDropdown,
      rxDropdown,
      virusDropdown
    })}</>;

}
