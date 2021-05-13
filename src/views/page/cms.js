import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// import sleep from 'sleep-promise';
import {Header} from 'semantic-ui-react';

import setTitle from '../../utils/set-title';
import PageLoader from '../../components/page-loader';
import Banner from '../../components/banner';
import Markdown from 'sierra-frontend/dist/components/markdown';
import refDataLoader from '../../components/refdata-loader';
import BackToTop from '../../components/back-to-top';

import style from './style.module.scss';


class CMSPage extends React.Component {

  static propTypes = {
    pageName: PropTypes.string.isRequired,
    pageTitle: PropTypes.string.isRequired,
    introHeader: PropTypes.string,
    toc: PropTypes.bool,
    tocFloat: PropTypes.oneOf(['none', 'left', 'right']).isRequired,
    hideLastModified: PropTypes.bool,
    lastModified: PropTypes.string.isRequired,
    escapeHtml: PropTypes.bool,
    collapsableLevels: PropTypes.array,
    referenceTitle: PropTypes.string,
    heroImage: PropTypes.string,
    cmsPrefix: PropTypes.string.isRequired,
    imagePrefix: PropTypes.string.isRequired,
    tables: PropTypes.objectOf(PropTypes.shape({
      columnDefs: PropTypes.array.isRequired,
      data: PropTypes.array.isRequired
    }).isRequired),
    children: PropTypes.node
  }

  static defaultProps = {
    tocFloat: 'right'
  }

  constructor() {
    super(...arguments);
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    this.updateScroll();
  }

  updateScroll = () => {
    const {current: container} = this.containerRef;
    if (!container) {
      setTimeout(this.updateScroll, 50);
      return;
    }
    const images = Array.from(container.querySelectorAll('img'));
    let loadingImages = images.length;
    images.forEach(image => {
      if (image.complete) {
        loadingImages --;
        if (loadingImages === 0) {
          scrollToAnchor();
          setTimeout(scrollToAnchor, 500);
        }
      }
      else {
        const onImageLoad = () => {
          loadingImages --;
          if (loadingImages === 0) {
            scrollToAnchor();
            setTimeout(scrollToAnchor, 500);
          }
          image.removeEventListener('load', onImageLoad, false);
        };
        image.addEventListener('load', onImageLoad, false);
      }
    });

    function scrollToAnchor() {
      const {hash} = window.location;
      if (hash && hash.length > 1) {
        const anchor = hash.slice(1);
        const elem = document.getElementById(anchor);
        if (elem) {
          elem.scrollIntoView({block: 'center'});
        }
      }
    }
  }

  render() {
    const {
      pageName,
      pageTitle,
      introHeader,
      toc,
      tocFloat,
      hideLastModified,
      lastModified,
      cmsPrefix,
      collapsableLevels,
      referenceTitle,
      heroImage,
      imagePrefix,
      genomeMaps,
      tables,
      children
    } = this.props;
    const content = (
      this.props.content
        .replace(/\$\$CMS_PREFIX\$\$/g, cmsPrefix)
    );
    const escapeHtml = this.props.escapeHtml === false ? false : true;
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
      <article
       ref={this.containerRef}
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
                Last updated on {lastMod}
              </span>}
            </Banner.Subtitle>
          </Banner> :
          <Header as="h1" dividing>
            <Markdown inline>{introHeader}</Markdown>
            <Header.Subheader>
              {hideLastModified ? null :
              <span className={style['last-update']}>
                Last updated on {lastMod}
              </span>}
            </Header.Subheader>
          </Header>}
        {children}
        <Markdown
         key={pageName}
         toc={toc} tocClassName={classNames(
           style.toc,
           style[`toc-float-${tocFloat}`]
         )}
         imagePrefix={imagePrefix}
         cmsPrefix={cmsPrefix}
         genomeMaps={genomeMaps}
         tables={tables}
         escapeHtml={escapeHtml}
         refDataLoader={refDataLoader}
         collapsableLevels={collapsableLevels}
         referenceTitle={referenceTitle}>
          {content}
        </Markdown>
      </article>
    );
  }
}


export default function CMSPageContainer({pageName, children}) {
  return (
    <PageLoader
     pageName={pageName}
     component={CMSPage}
     childProps={{children}} />
  );
}


CMSPageContainer.propTypes = {
  pageName: PropTypes.string.isRequired,
  children: PropTypes.node
};
