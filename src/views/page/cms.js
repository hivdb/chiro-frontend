import React from 'react';
import PropTypes from 'prop-types';
import sleep from 'sleep-promise';
import {Header} from 'semantic-ui-react';

import {loadPage} from '../../utils/cms';
import setTitle from '../../utils/set-title';
import Markdown from '../../components/markdown';
import BackToTop from '../../components/back-to-top';
import PromiseComponent from '../../utils/promise-component';
import {
  ReferenceContext,
  ReferenceContextValue} from '../../components/references';

import style from './style.module.scss';


export default class CMSPage extends React.Component {

  static propTypes = {
    location: PropTypes.object.isRequired,
    pageName: PropTypes.string.isRequired
  }

  constructor() {
    super(...arguments);
    this._scrollTops = {};
  }

  async updatePage(props) {
    const {pageName} = props;
    const {hash, query: {_: internalQuery}} = props.location;
    if (!window.__SERVER_RENDERING) {
      let scrollTop;
      if (!hash || hash === '' || hash === '#') {
        scrollTop = this._scrollTops[pageName] || 0;
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
  }

  componentWillMount() {
    this.updatePage(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._scrollTops[this.props.pageName] = window.pageYOffset;
    this.updatePage(nextProps);
  }

  thenRender = ({
    pageTitle, introHeader, content, isHtml, toc,
    hideLastModified, lastModified, cmsPrefix, escapeHtml,
    referenceTitle
  }) => {
    content = content.replace(/\$\$CMS_PREFIX\$\$/g, cmsPrefix);
    const {pageName} = this.props;
    escapeHtml = escapeHtml === false ? false : true;
    let lastMod;
    if (!hideLastModified) {
      lastMod = new Date(lastModified).toLocaleDateString(
        'en-US', {year: 'numeric', month: 'short', day: 'numeric'}
      );
    }
    setTitle(pageTitle);
    return (
      <ReferenceContext.Provider value={new ReferenceContextValue()}>
        <article
         className={style['content-container']}
         data-page-name={pageName}>
          <Header as="h1" dividing>
            <Markdown inline>{introHeader}</Markdown>
            <Header.Subheader>
              {hideLastModified ? null : <span className={style['last-update']}>
                Last updated at {lastMod.toLocaleString('en-US')}
              </span>}
            </Header.Subheader>
          </Header>
          <Markdown
           toc={toc} escapeHtml={escapeHtml}
           referenceTitle={referenceTitle}>
            {content}
          </Markdown>
          <BackToTop />
        </article>
      </ReferenceContext.Provider>
    );
  };

  errorRender = () => {
    return "Page not found.";
  };

  render() {
    const {pageName} = this.props;
    const promise = loadPage(`page-${pageName}`);

    return (
      <PromiseComponent
       promise={promise}
       error={this.errorRender}
       then={this.thenRender} />
    );
  }
}
