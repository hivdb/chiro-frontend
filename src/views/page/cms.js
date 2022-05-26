import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import PageLoader from '../../components/page-loader';
import Markdown from 'sierra-frontend/dist/components/markdown';
import refDataLoader from '../../components/refdata-loader';

import CMSLayout from './cms-layout';
import style from './style.module.scss';


CMSPage.propTypes = {
  pageName: PropTypes.string.isRequired,
  pageTitle: PropTypes.string.isRequired,
  redirect: PropTypes.string,
  introHeader: PropTypes.string,
  subIntroHeader: PropTypes.string,
  githubLink: PropTypes.string,
  githubTitle: PropTypes.string,
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
  content: PropTypes.string.isRequired,
  genomeMaps: PropTypes.object,
  children: PropTypes.node
};


CMSPage.defaultProps = {
  tocFloat: 'right'
};

function CMSPage({
  pageName,
  pageTitle,
  redirect,
  introHeader,
  subIntroHeader,
  toc,
  tocFloat,
  hideLastModified,
  lastModified,
  cmsPrefix,
  content,
  escapeHtml,
  collapsableLevels,
  referenceTitle,
  heroImage,
  imagePrefix,
  genomeMaps,
  tables,
  children,
  githubLink,
  githubTitle
}) {
  content = content.replace(/\$\$CMS_PREFIX\$\$/g, cmsPrefix);
  escapeHtml = escapeHtml === false ? false : true;

  return (
    <CMSLayout {...{
      pageName,
      pageTitle,
      redirect,
      introHeader: <Markdown inline>{introHeader}</Markdown>,
      subIntroHeader,
      hideLastModified,
      lastModified,
      heroImage,
      imagePrefix,
      githubLink,
      githubTitle
    }}>
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
    </CMSLayout>
  );
}

CMSPageContainer.propTypes = {
  pageName: PropTypes.string.isRequired,
  children: PropTypes.node
};

export default function CMSPageContainer({pageName, children}) {
  return (
    <PageLoader
     pageName={`page-${pageName}`}
     component={CMSPage}>
      {children}
    </PageLoader>
  );
}
