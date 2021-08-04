import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Header} from 'semantic-ui-react';

import {H1} from 'sierra-frontend/dist/components/heading-tags';
import StatHeader from '../../components/stat-header';
import ArticleInfo from '../../components/article-info';

import SearchBox from './search-box';

import style from './style.module.scss';


function SearchDRDBStatHeader({
  abNames,
  antibodies,
  article,
  articles,
  convPlasmaValue,
  formOnly,
  infectedVariants,
  isolateAggs,
  loaded,
  mutationText,
  onChange,
  refName,
  vaccineName,
  vaccines,
  varName,
  variants
}) {

  return (
    <Grid.Row>
      <SearchBox
       loaded={loaded}
       formOnly={formOnly}
       articleValue={refName}
       articles={articles}
       antibodyValue={abNames}
       antibodies={antibodies}
       vaccineValue={vaccineName}
       vaccines={vaccines}
       infectedVariants={infectedVariants}
       convPlasmaValue={convPlasmaValue}
       variantValue={varName}
       variants={variants}
       isolateAggs={isolateAggs}
       mutationText={mutationText}
       onChange={onChange}>
        {({
          articleDropdown,
          rxDropdown,
          variantDropdown,
          mutationsInput
        }) => (
          <StatHeader>
            {[
              {
                className: style['search-box'],
                width: 4,
                cells: [
                  {label: 'Reference', value: articleDropdown},
                  {label: 'Plasma / Monoclonal antibody', value: rxDropdown},
                  {label: 'Variant', value: variantDropdown}
                ]
              },
              {
                width: 12,
                className: style['search-summary'],
                description: formOnly ? <>
                  <Header as={H1} disableAnchor>
                    Resistance Database Search
                  </Header>
                  <p>
                    Select an option from left drop down
                    lists to start searching.
                  </p>
                </> : <>
                  {article ? <ArticleInfo {...article} /> : null}
                </>
              }
            ]}
          </StatHeader>
        )}
      </SearchBox>
    </Grid.Row>
  );

}


SearchDRDBStatHeader.propTypes = {
  abNames: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ),
  antibodies: PropTypes.array,
  article: PropTypes.object,
  articles: PropTypes.array,
  convPlasmaValue: PropTypes.string,
  formOnly: PropTypes.bool.isRequired,
  infectedVariants: PropTypes.array,
  isolateAggs: PropTypes.array,
  loaded: PropTypes.bool.isRequired,
  mutationText: PropTypes.string,
  onChange: PropTypes.func,
  refName: PropTypes.string,
  vaccineName: PropTypes.string,
  vaccines: PropTypes.array,
  varName: PropTypes.string,
  variants: PropTypes.array
};

SearchDRDBStatHeader.defaultProps = {
  formOnly: false,
  loaded: false
};

export default SearchDRDBStatHeader;
