import React from 'react';
import {Loader} from 'semantic-ui-react';

import {H2} from 'sierra-frontend/dist/components/heading-tags';
import Markdown from 'sierra-frontend/dist/components/markdown';
import useSmartAsync from 'sierra-frontend/dist/utils/use-smart-async';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';

import {loadPage} from '../../utils/cms';

import Subscribe from './subscribe';
import ProjectsSection from '../../components/projects-section';

// const URL_PK_NOTES = (
//   'https://docs.google.com/document/d/e/2PACX-1vSBYQ57vlEJYa2t-' +
//   'tDg7l0H3625fjrPSThbCRN2bt1BeJguD24SBfe9Rp6j5lR6dV1p4NR3YWpW3yh1/pub');


function Home() {

  const promiseFn = React.useCallback(
    () => loadPage('home-staging'),
    []
  );

  const {
    data: {
      projectSections = [],
      missionStatement, imagePrefix
    } = {}
  } = useSmartAsync({promiseFn});

  setTitle(null);

  return <>
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
    <section className={style['home-section']}>
      <H2 disableAnchor>Mission Statement</H2>
      {missionStatement ?
        <Markdown>{missionStatement}</Markdown> :
        <Loader active />}
    </section>
    <Subscribe />
  </>;
 
}

export default Home;
