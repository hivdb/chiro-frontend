import React from 'react';
import PropTypes from 'prop-types';
import sleep from 'sleep-promise';
import {Header} from 'semantic-ui-react';

import {loadPage} from '../../utils/cms';
import setTitle from '../../utils/set-title';
import Banner from '../../components/banner';
import Markdown from '../../components/markdown';
import BackToTop from '../../components/back-to-top';
import PromiseComponent from '../../utils/promise-component';
import {
  ReferenceContext,
  ReferenceContextValue} from '../../components/references';

import style from './style.module.scss';


const _scrollTops = {};

async function updateScroll(props) {
  const {pageName} = props;
  const {hash, query: {_: internalQuery}} = props.location;
  let scrollTop;
  if (!hash || hash === '' || hash === '#') {
    scrollTop = _scrollTops[pageName] || 0;
  }
  if (typeof internalQuery === 'string') {
    const {y} = JSON.parse(atob(internalQuery));
    if (y) {
      scrollTop = y;
    }
  }
  let tryTimes = 10;
  if (typeof scrollTop === 'undefined') {
    return;
  }
  while (tryTimes --) {
    await sleep(50);
    window.scrollTo(0, scrollTop);
    if (window.scrollY === scrollTop) {
      break;
    }
  }
}


export default class CMSPage extends React.Component {

  static propTypes = {
    location: PropTypes.object.isRequired,
    pageName: PropTypes.string.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    const {pageName} = props;
    if (pageName !== state.pageName) {
      state.promise = loadPage(`page-${pageName}`);
    }
    _scrollTops[pageName] = window.pageYOffset;
    updateScroll(props);
    return state;
  }

  constructor() {
    super(...arguments);
    const {pageName} = this.props;
    const promise = loadPage(`page-${pageName}`);
    this.state = {promise, pageName};
  }

  thenRender = ({
    pageTitle, introHeader, content, isHtml, toc,
    hideLastModified, lastModified, cmsPrefix, escapeHtml,
    referenceTitle, heroImage, collapsable, imagePrefix
  }) => {
    content = content.replace(/\$\$CMS_PREFIX\$\$/g, cmsPrefix);
    const {pageName} = this.props;
    escapeHtml = escapeHtml === false ? false : true;
    let lastMod;
    if (!hideLastModified) {
      lastMod = new Date(lastModified).toLocaleString(
        'en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: 'numeric', minute: 'numeric'
        }
      );
    }
    setTitle(pageTitle);
    return (
      <ReferenceContext.Provider value={new ReferenceContextValue()}>
        <article
         className={style['content-container']}
         data-page-name={pageName}>
          <BackToTop />
          {heroImage ?
            <Banner bgImage={`${imagePrefix}${heroImage}`} narrow>
              <Banner.Title as="h1">
                <Markdown inline>{introHeader}</Markdown>
              </Banner.Title>
              <Banner.Subtitle>
                {hideLastModified ? null :
                <span className={style['last-update']}>
                  Last updated at {lastMod}
                </span>}
              </Banner.Subtitle>
            </Banner> :
            <Header as="h1" dividing>
              <Markdown inline>{introHeader}</Markdown>
              <Header.Subheader>
                {hideLastModified ? null :
                <span className={style['last-update']}>
                  Last updated at {lastMod}
                </span>}
              </Header.Subheader>
            </Header>}
          <Markdown
           toc={toc} tocClassName={style.toc}
           escapeHtml={escapeHtml}
           referenceTitle={referenceTitle}>
            {content}
          </Markdown>
        </article>
      </ReferenceContext.Provider>
    );
  };

  errorRender = () => {
    return "Page not found.";
  };

  render() {
    const {promise} = this.state;

    return (
      <PromiseComponent
       promise={promise}
       error={this.errorRender}
       then={this.thenRender} />
    );
  }
}
