import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import useRouter from 'found/useRouter';
import {Loader} from 'semantic-ui-react';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import {H2, H3} from 'icosa/components/heading-tags';
import verticalTabsStyle, {useToggleTabs} from
  'icosa/components/vertical-tabs-style';
import Markdown from 'icosa/components/markdown';

import {useSetLoading} from '../../utils/set-loading';
import PageLoader from '../../components/page-loader';
import CMSLayout from '../page/cms-layout';

import ConsensusViewer from './consensus-viewer';
import style from './style.module.scss';


Variant.propTypes = {
  subPageName: PropTypes.string.isRequired,
  pageTitle: PropTypes.string.isRequired,
  drdbVersion: PropTypes.string.isRequired,
  cmsPrefix: PropTypes.string.isRequired,
  imagePrefix: PropTypes.string.isRequired,
  regionPresets: PropTypes.object.isRequired,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      subTitle: PropTypes.string,
      contentBefore: PropTypes.string,
      attrlist: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ),
      autoGenomeMaps: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          varName: PropTypes.string.isRequired,
          parentVarName: PropTypes.string,
          source: PropTypes.string
        }).isRequired
      ),
      contentAfter: PropTypes.string
    }).isRequired
  ).isRequired,
  contentAfter: PropTypes.string,
  tables: PropTypes.objectOf(PropTypes.shape({
    columnDefs: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired
  }).isRequired)
  // genomeMaps: PropTypes.object
};

function Variant({
  subPageName,
  pageTitle,
  drdbVersion,
  cmsPrefix,
  imagePrefix,
  regionPresets,
  sections,
  contentAfter,
  tables,
  // genomeMaps,
  ...props
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
    subTitle: secSubTitle,
    contentBefore: secContentBefore,
    contentAfter: secContentAfter,
    attrlist: secAttrList,
    autoGenomeMaps = []
    // content = ''
  } = sections[selectedIndex] || {};

  // const finalContent = content.replace(/\$\$CMS_PREFIX\$\$/g, cmsPrefix);
  // const finalEscapeHtml = escapeHtml === false ? false : true;

  const [tabsExpanded, togglerNode, resetExpansion] = useToggleTabs();

  const setSelectedIndex = React.useCallback(
    idx => {
      resetExpansion();
      const {name} = sections[idx];
      setLoading(() => router.push(`/variants/${name}/`));
    },
    [resetExpansion, sections, router, setLoading]
  );
  const mdProps = {
    tables,
    escapeHtml: false,
    imagePrefix,
    cmsPrefix
  };

  React.useEffect(
    () => {
      if (selectedIndex < 0) {
        setSelectedIndex(0);
      }
    },
    [selectedIndex, setSelectedIndex]
  );

  return (
    <CMSLayout {...{
      pageTitle: `${pageTitle} - ${secTitle}`,
      imagePrefix,
      ...props
    }}>
      <div
       ref={containerRef}
       className={style['variant-container']}>
        <Tabs
         data-tabs-expanded={tabsExpanded}
         className={classNames(
           style['variant-tabs'],
           verticalTabsStyle['vertical-tabs']
         )}
         onSelect={setSelectedIndex}
         selectedIndex={selectedIndex}>
          <TabList>
            {sections.map(({title, name, subTitle}) => (
              <Tab key={`tab-${name}`}>
                <Link
                 className={style['tab-link']}
                 to={`/variants/${name}/`}>
                  <Markdown inline>
                    **{title}**{subTitle ? `  \n${subTitle}` : ''}
                  </Markdown>
                </Link>
              </Tab>
            ))}
          </TabList>
          {togglerNode}
          {sections.map(({name}, idx) => (
            <TabPanel key={`tabpanel-${name}`}>
              {idx === selectedIndex ? <section>
                <H2 disableAnchor>
                  {secTitle}
                  {secSubTitle ? <>
                    {'\xa0'}
                    <div className={style['short-desc']}>
                      {secSubTitle}
                    </div>
                  </> : null}
                </H2>
                {secContentBefore ? <Markdown
                 key={`${subPageName}-content-before`}
                 {...mdProps}>
                  {secContentBefore}
                </Markdown> : null}
                {secAttrList ? <ul className={style['attr-list']}>
                  {secAttrList.map((attrContent, idx) => (
                    <li key={`${subPageName}-attrlist-${idx}`}>
                      <Markdown inline {...mdProps}>
                        {attrContent}
                      </Markdown>
                    </li>
                  ))}
                </ul> : null}
                {autoGenomeMaps ? autoGenomeMaps.map(
                  ({varName, parentVarName, title, source}) => <section
                   key={`section-${varName}`}
                   className={style['consensus-section']}>
                    <H3 disableAnchor>
                      {title}
                      {source ? <>
                        {'\xa0'}
                        <span className={style['consensus-source']}>
                          (source:{' '}
                          <Markdown inline {...mdProps}>
                            {source}
                          </Markdown>
                          )
                        </span>
                      </> : null}
                    </H3>
                    <ConsensusViewer
                     {...{
                       varName,
                       parentVarName,
                       regionPresets,
                       drdbVersion
                     }} />
                  </section>
                ) : null}
                {secContentAfter ? <Markdown
                 key={`${subPageName}-content-after`}
                 {...mdProps}>
                  {secContentAfter}
                </Markdown> : null}
              </section> : null}
            </TabPanel>
          ))}
        </Tabs>
        {contentAfter ? <Markdown
         key={`content-after`}
         {...mdProps}>
          {contentAfter}
        </Markdown> : null}
        <div className={style['variant-loader']}>
          <Loader active inline />
        </div>
      </div>
    </CMSLayout>
  );
}


VariantContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default function VariantContainer({match: {params: {name}}}) {
  return (
    <PageLoader
     pageName="variants"
     subPageName={name}
     component={Variant} />
  );
}
