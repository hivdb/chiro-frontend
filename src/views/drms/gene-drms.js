import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import useRouter from 'found/useRouter';
import Loader from 'icosa/components/loader';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import verticalTabsStyle, {useToggleTabs} from
  'icosa/components/vertical-tabs-style';
import Markdown from 'icosa/components/markdown';

import {useSetLoading} from '../../utils/set-loading';
import PageLoader from '../../components/page-loader';
import CMSLayout from '../page/cms-layout';

import SpikeDRMs from './spike-drms';
import MproDRMs from './3clpro-drms';
import RdRPDRMs from './rdrp-drms';
import style from './style.module.scss';


GeneDRMs.propTypes = {
  drdbVersion: PropTypes.string.isRequired,
  sectionName: PropTypes.string.isRequired,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      gene: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  lastModified: PropTypes.string.isRequired
};


function GeneDRMs({drdbVersion, sectionName, sections, lastModified}) {

  const {router} = useRouter();
  const containerRef = React.useRef();
  const setLoading = useSetLoading(containerRef);

  const secProps = React.useMemo(
    () => sections.find(s => s.name === sectionName),
    [sections, sectionName]
  );

  const [tabsExpanded, togglerNode, resetExpansion] = useToggleTabs();

  const selectedIndex = React.useMemo(
    () => sections.findIndex(s => s.name === sectionName),
    [sections, sectionName]
  );

  const setSelectedIndex = React.useCallback(
    idx => {
      resetExpansion();
      const {name} = sections[idx];
      setLoading(() => router.push(`/drms/${name}/`));
    },
    [resetExpansion, sections, router, setLoading]
  );

  React.useEffect(
    () => {
      if (selectedIndex < 0) {
        setSelectedIndex(0);
      }
    },
    [selectedIndex, setSelectedIndex]
  );

  return (
    <CMSLayout
     lastModified={lastModified}
     pageTitle={`SARS-CoV-2 Resistance Mutations - ${secProps.title}`}
     introHeader={`SARS-CoV-2 Resistance Mutations - ${secProps.title}`}>
      <div
       ref={containerRef}
       data-current-section={secProps.name}
       className={style['drms-container']}>
        <Tabs
         data-tabs-expanded={tabsExpanded}
         className={classNames(
           style['drms-tabs'],
           verticalTabsStyle['vertical-tabs']
         )}
         onSelect={setSelectedIndex}
         selectedIndex={selectedIndex}>
          <TabList>
            {sections.map(({title, name}) => (
              <Tab key={`tab-${name}`}>
                <Link
                 className={style['tab-link']}
                 to={`/drms/${name}/`}>
                  <Markdown inline>**{title}**</Markdown>
                </Link>
              </Tab>
            ))}
          </TabList>
          {togglerNode}
          {sections.map(({name}, idx) => (
            <TabPanel key={`tabpanel-${name}`}>
              {idx === selectedIndex ? <>
                {name === 'spike' ? (
                  <SpikeDRMs drdbVersion={drdbVersion} {...secProps} />
                ) : null}
                {name === '3clpro' ? (
                  <MproDRMs drdbVersion={drdbVersion} {...secProps} />
                ) : null}
                {name === 'rdrp' ? (
                  <RdRPDRMs drdbVersion={drdbVersion} {...secProps} />
                ) : null}
              </> : null}
            </TabPanel>
          ))}
        </Tabs>
        <div className={style['drms-loader']}>
          <Loader inline />
        </div>
      </div>
    </CMSLayout>
  );
}


GeneDRMsContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default function GeneDRMsContainer({match: {params: {name}}}) {
  return (
    <PageLoader
     pageName="sars2-drms"
     sectionName={name}
     component={GeneDRMs} />
  );
}
