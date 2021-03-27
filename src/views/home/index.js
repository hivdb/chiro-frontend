import React from 'react';
import {Link, routerShape} from 'found';
import {Loader} from 'semantic-ui-react';

import {H2} from 'sierra-frontend/dist/components/heading-tags';
import BasicTOC from 'sierra-frontend/dist/components/toc';
import Markdown from 'sierra-frontend/dist/components/markdown';
import Banner from './banner';
import {InlineSearchBox} from '../../components/search-box';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';

import {getFullLink} from '../../utils/cms';
import PromiseComponent from '../../utils/promise-component';
import {loadPage} from '../../utils/cms';

import Subscribe from './subscribe';
import ProjectsSection from './projects-section';

// const URL_PK_NOTES = (
//   'https://docs.google.com/document/d/e/2PACX-1vSBYQ57vlEJYa2t-' +
//   'tDg7l0H3625fjrPSThbCRN2bt1BeJguD24SBfe9Rp6j5lR6dV1p4NR3YWpW3yh1/pub');


export default class Home extends React.Component {

  static propTypes = {
    router: routerShape.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      promise: loadPage('home')
    };
  }

  handleExpSearchBoxChange = (actions) => {
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
    this.props.router.push(
      {pathname: '/search/', query}
    );
  }

  handleTrialSearchBoxChange = (value, category) => {
    if (value === null) {
      this.props.router.push({pathname: '/clinical-trials/'});
      return;
    }
    const query = {};
    if (category === 'compounds') {
      query.compound = value;
    }
    else if (category === 'compoundTargets') {
      query.target = value;
    }
    else {
      query.trialcat = value;
    }
    this.props.router.push(
      {pathname: '/clinical-trials/', query}
    );
  }

  thenRender = ({
    banner, updates,
    projectSections = [],
    missionStatement, imagePrefix
  } = {}) => {
    setTitle(null);
    return <>
      <Banner
       bgImage={
         banner && banner.image ?
           getFullLink(`images/${banner.image}`) : undefined
       }>
        {banner ? banner.tocInfinity.map(({title, link, tocContent}) => (
          <Banner.SubSection key={title}>
            <h2>
              <Link to={link}>{title}</Link>
            </h2>
            <BasicTOC className={style['scroll-toc']}>
              <Markdown escapeHtml={false} inline>{tocContent}</Markdown>
            </BasicTOC>
          </Banner.SubSection>
        )) : <Loader active />}
        {updates ?
          <Banner.Slider
           title={<a href="/page/updates/">Updates</a>}
           endHref="/page/updates/">
            <Markdown
             escapeHtml={false}
             referenceHeadingTagLevel={3}
             disableHeadingTagAnchor>
              {updates}
            </Markdown>
          </Banner.Slider> :
          <Loader active />}
      </Banner>
      <section className={style['home-section']}>
        <H2 disableAnchor>Database Search</H2>
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
           onChange={this.handleExpSearchBoxChange}>
            {({
              compoundTargetDropdown,
              compoundDropdown,
              virusDropdown,
              studyTypeDropdown
            }) => <>
              <div className={style['home-search-item']}
               data-type-item-container>
                <label className={style['home-search-label']}>Target</label>
                {compoundTargetDropdown}
              </div>
              <div className={style['home-search-item']}
               data-type-item-container>
                <label className={style['home-search-label']}>Compound</label>
                {compoundDropdown}
              </div>
              <div className={style['home-search-item']}
               data-type-item-container>
                <label className={style['home-search-label']}>Virus</label>
                {virusDropdown}
              </div>
              <div className={style['home-search-item']}
               data-type-item-container>
                <label className={style['home-search-label']}>Study Type</label>
                {studyTypeDropdown}
              </div>
            </>}
          </InlineSearchBox>
        </div>
      </section>
      {projectSections.map(({title, items}) => (
        <ProjectsSection
         key={title}
         title={title}
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

  render() {
    const {promise} = this.state;

    return (
      <PromiseComponent
       promise={promise}
       error={this.errorRender}
       then={this.thenRender}>
        {this.thenRender()}
      </PromiseComponent>
    );
  }

}
