import React from 'react';

import {useRouter} from 'found';
import {H2} from 'sierra-frontend/dist/components/heading-tags';
import useSmartAsync from 'sierra-frontend/dist/utils/use-smart-async';
import setTitle from '../../utils/set-title';

import {loadPage} from '../../utils/cms';

import {InlineSearchBox} from '../../components/search-box';
import ProjectsSection from '../../components/projects-section';

import style from './style.module.scss';

// const URL_PK_NOTES = (
//   'https://docs.google.com/document/d/e/2PACX-1vSBYQ57vlEJYa2t-' +
//   'tDg7l0H3625fjrPSThbCRN2bt1BeJguD24SBfe9Rp6j5lR6dV1p4NR3YWpW3yh1/pub');


function AntiviralPortal() {

  const {router} = useRouter();

  const promiseFn = React.useCallback(
    () => loadPage('antiviral-portal'),
    []
  );

  const handleExpSearchBoxChange = React.useCallback(
    actions => {
      const query = {};
      for (let [value, category] of actions) {
        value = value || undefined;
        if (category === 'articles') {
          query.article = value;
        }
        else if (category === 'compounds') {
          query.compound = value;
        }
        else if (category === 'compoundTargets') {
          query.target = value;
        }
        else if (category === 'studyTypes') {
          query.study = value;
        }
        else {
          query.virus = value;
        }
      }
      router.push({pathname: '/search/', query});
    },
    [router]
  );

  const {
    data: {
      projectSections = [],
      imagePrefix
    } = {}
  } = useSmartAsync({promiseFn});

  setTitle(null);

  return <article className={style['antiviral-portal']}>
    <section className={style['home-section']}>
      <H2 disableAnchor>Search Antiviral Database</H2>
      <div className={style['home-search-container']}>
        <InlineSearchBox
         allowEmpty
         articleValue={null}
         compoundValue={null}
         virusValue={null}
         studyTypeValue={null}
         compoundTargetValue={null}
         placeholder={'Select item'}
         compoundPlaceholder={'Enter text or select item'}
         onChange={handleExpSearchBoxChange}>
          {({
            compoundTargetDropdown,
            compoundDropdown,
            virusDropdown,
            studyTypeDropdown
          }) => <>
            <div
             className={style['home-search-item']}
             data-type-item-container>
              <label className={style['home-search-label']}>Target</label>
              {compoundTargetDropdown}
            </div>
            <div
             className={style['home-search-item']}
             data-type-item-container>
              <label className={style['home-search-label']}>Compound</label>
              {compoundDropdown}
            </div>
            <div
             className={style['home-search-item']}
             data-type-item-container>
              <label className={style['home-search-label']}>Virus</label>
              {virusDropdown}
            </div>
            <div
             className={style['home-search-item']}
             data-type-item-container>
              <label className={style['home-search-label']}>Study Type</label>
              {studyTypeDropdown}
            </div>
          </>}
        </InlineSearchBox>
      </div>
    </section>
    {projectSections.map(({
      title,
      displayTitle = true,
      items
    }) => (
      <ProjectsSection
       key={title}
       title={title}
       displayTitle={displayTitle}
       projects={items}
       imagePrefix={imagePrefix} />
    ))}
  </article>;
 
}

export default AntiviralPortal;
