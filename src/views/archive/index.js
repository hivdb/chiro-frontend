import React from 'react';
import {routerShape} from 'found';
import setTitle from '../../utils/set-title';

import PromiseComponent from '../../utils/promise-component';
import {loadPage} from '../../utils/cms';
import Banner from '../../components/banner';
import BackToTop from '../../components/back-to-top';
import ProjectsSection from '../../components/projects-section';
import Markdown from 'icosa/components/markdown';
import {Header} from 'semantic-ui-react';

import style from './style.module.scss';


export default class Home extends React.Component {

  static propTypes = {
    router: routerShape.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      promise: loadPage('archive')
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
  };

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
  };

  thenRender = ({
    projectSections = [],
    imagePrefix,
    pageName,
    heroImage,
    introHeader
  } = {}) => {
    setTitle(null);
    return (
      <article
       className={style['content-container']}
       data-page-name={pageName}>
        <BackToTop />
        {heroImage ?
          <Banner bgImage={`${imagePrefix}${heroImage}`} narrow>
            <Banner.Title as="h1">
              <Markdown inline>{introHeader}</Markdown>
            </Banner.Title>
          </Banner> :
          <Header as="h1" dividing>
            <Markdown inline>{introHeader}</Markdown>
          </Header>}
        {projectSections.map(({title, items}) => (
          <ProjectsSection
           key={title}
           title={title}
           projects={items}
           imagePrefix={imagePrefix} />
        ))}
      </article>
    );
  };

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
