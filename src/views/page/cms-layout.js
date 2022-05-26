import React from 'react';
import PropTypes from 'prop-types';
import useRouter from 'found/useRouter';
import {Header} from 'semantic-ui-react';

import setTitle from '../../utils/set-title';
import Banner from '../../components/banner';
import Markdown from 'sierra-frontend/dist/components/markdown';
import BackToTop from '../../components/back-to-top';
import GitHubCorner from '../../components/github-corner';

import useSyncScroll from './use-sync-scroll';
import style from './style.module.scss';


CMSLayout.propTypes = {
  pageName: PropTypes.string,
  pageTitle: PropTypes.string.isRequired,
  redirect: PropTypes.string,
  introHeader: PropTypes.node,
  subIntroHeader: PropTypes.string,
  githubLink: PropTypes.string,
  githubTitle: PropTypes.string,
  hideLastModified: PropTypes.bool,
  lastModified: PropTypes.string.isRequired,
  heroImage: PropTypes.string,
  imagePrefix: PropTypes.string.isRequired,
  children: PropTypes.node
};


export default function CMSLayout({
  pageName,
  pageTitle,
  redirect,
  introHeader,
  subIntroHeader,
  hideLastModified,
  lastModified,
  heroImage,
  imagePrefix,
  children,
  githubLink,
  githubTitle
}) {
  const {router} = useRouter();

  React.useEffect(
    () => {
      if (redirect) {
        router.replace(redirect);
      }
    },
    [redirect, router]
  );

  const containerRef = React.useRef();

  useSyncScroll(containerRef);

  let lastMod;
  if (!hideLastModified) {
    lastMod = new Date(lastModified).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  }
  setTitle(pageTitle);
  return <>
    <article
     ref={containerRef}
     className={style['content-container']}
     data-page-name={pageName}>
      <BackToTop />
      {heroImage ?
        <Banner bgImage={`${imagePrefix}${heroImage}`} narrow>
          <Banner.Title as="h1">
            {introHeader}
          </Banner.Title>
          <Banner.Subtitle>
            {subIntroHeader ? <div className={style['sub-intro-header']}>
              <Markdown inline>{subIntroHeader}</Markdown>
            </div> : null}
            {hideLastModified ? null :
            <div className={style['last-update']}>
              Last updated on {lastMod}
            </div>}
          </Banner.Subtitle>
        </Banner> :
        <Header as="h1" dividing>
          {introHeader}
          <Header.Subheader>
            {subIntroHeader ? <div className={style['sub-intro-header']}>
              <Markdown inline>{subIntroHeader}</Markdown>
            </div> : null}
            {hideLastModified ? null :
            <div className={style['last-update']}>
              Last updated on {lastMod}
            </div>}
          </Header.Subheader>
        </Header>}
      {children}
    </article>
    {githubLink ?
      <GitHubCorner href={githubLink} title={githubTitle} /> : null}
  </>;
}
