import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import useRouter from 'found/useRouter';
import {Loader} from 'semantic-ui-react';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';

import {useSetLoading} from '../../utils/set-loading';
import verticalTabsStyle, {useToggleTabs} from
'sierra-frontend/dist/components/vertical-tabs-style';
import refDataLoader from '../../components/refdata-loader';
import PageLoader from '../../components/page-loader';
import Markdown from 'sierra-frontend/dist/components/markdown';
import CMSLayout from '../page/cms-layout';
import style from './style.module.scss';


SuscData.propTypes = {
  subPageName: PropTypes.string.isRequired,
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
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      shortDesc: PropTypes.string.isRequired,
      desc: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  tables: PropTypes.objectOf(PropTypes.shape({
    columnDefs: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired
  }).isRequired),
  genomeMaps: PropTypes.object
};

function SuscData({
  subPageName,
  pageTitle,
  redirect,
  introHeader,
  subIntroHeader,
  githubLink,
  githubTitle,
  toc,
  tocFloat,
  hideLastModified,
  lastModified,
  escapeHtml,
  collapsableLevels,
  referenceTitle,
  heroImage,
  cmsPrefix,
  imagePrefix,
  sections,
  tables,
  genomeMaps
}) {
  const {router} = useRouter();
  const selectedIndex = React.useMemo(
    () => sections.findIndex(({name}) => name === subPageName),
    [sections, subPageName]
  );
  const containerRef = React.useRef();
  const setLoading = useSetLoading(containerRef);
  const {
    title: secTitle,
    shortDesc,
    desc: secDesc,
    content = ''
  } = sections[selectedIndex] || {};

  const finalContent = content.replace(/\$\$CMS_PREFIX\$\$/g, cmsPrefix);
  const finalEscapeHtml = escapeHtml === false ? false : true;

  const [tabsExpanded, togglerNode, resetExpansion] = useToggleTabs();

  const setSelectedIndex = React.useCallback(
    idx => {
      resetExpansion();
      const {name} = sections[idx];
      setLoading(() => router.push(`/susceptibility-data/${name}/`));
    },
    [resetExpansion, sections, router, setLoading]
  );

  return (
    <CMSLayout {...{
      pageTitle: `${pageTitle} - ${secTitle} - ${shortDesc}`,
      redirect,
      introHeader,
      subIntroHeader: `${secTitle}: ${secDesc}  \n(${subIntroHeader})`,
      hideLastModified,
      lastModified,
      heroImage,
      imagePrefix,
      githubLink,
      githubTitle
    }}>
      <div
       ref={containerRef}
       className={style['susc-data-container']}>
        <Tabs
         data-tabs-expanded={tabsExpanded}
         className={classNames(
           style['susc-data-tabs'],
           verticalTabsStyle['vertical-tabs']
         )}
         onSelect={setSelectedIndex}
         selectedIndex={selectedIndex}>
          <TabList>
            {sections.map(({title, name, desc}) => (
              <Tab key={`tab-${name}`}>
                <Link
                 className={style['tab-link']}
                 to={`/susceptibility/${name}/`}>
                  <Markdown inline>**{title}**{'  \n'}{desc}</Markdown>
                </Link>
              </Tab>
            ))}
          </TabList>
          {togglerNode}
          {sections.map(({name}, idx) => (
            <TabPanel key={`tabpanel=${name}`}>
              {idx === selectedIndex ? (
                <Markdown
                 disableHeadingTagAnchor
                 key={subPageName}
                 toc={toc} tocClassName={classNames(
                   style.toc,
                   style[`toc-float-${tocFloat}`]
                 )}
                 imagePrefix={imagePrefix}
                 cmsPrefix={cmsPrefix}
                 genomeMaps={genomeMaps}
                 tables={tables}
                 escapeHtml={finalEscapeHtml}
                 refDataLoader={refDataLoader}
                 collapsableLevels={collapsableLevels}
                 referenceTitle={referenceTitle}>
                  ## {secTitle}: {secDesc}{'\n\n'}
                  {finalContent}
                </Markdown>
              ) : null}
            </TabPanel>
          ))}
        </Tabs>
        <div className={style['susc-data-loader']}>
          <Loader active inline />
        </div>
      </div>
    </CMSLayout>
  );
}


SuscDataContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default function SuscDataContainer({match: {params: {name}}}) {
  return (
    <PageLoader
     pageName="susceptibility-data"
     subPageName={name}
     component={SuscData} />
  );
}
