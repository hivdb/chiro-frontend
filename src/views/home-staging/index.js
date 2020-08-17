import React from 'react';
import {Link, routerShape} from 'found';
import {List, Loader, Button, Icon} from 'semantic-ui-react';

import {H2} from '../../components/heading-tags';
import BasicTOC from '../../components/toc';
import Markdown from '../../components/markdown';
import Banner from '../../components/banner';
import {InlineSearchBox} from '../../components/search-box';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';
import imageRemdesivir from '../../assets/images/remdesivir.png';
import imageSARS2 from '../../assets/images/sars2.png';
import image3CL from '../../assets/images/3cl.png';
import imagePetriDish from '../../assets/images/petri-dish.png';
import imageMouse from '../../assets/images/mouse.png';
import imagePK from '../../assets/images/pk.png';
import imageMeasurement from '../../assets/images/measurement.png';
import imageClinicalTrial from '../../assets/images/clinical-trial.png';
import imageReferences from '../../assets/images/references.png';

import {getFullLink} from '../../utils/cms';
import PromiseComponent from '../../utils/promise-component';
import {loadPage} from '../../utils/cms';

import Subscribe from './subscribe';

const URL_PK_NOTES = (
  'https://docs.google.com/document/d/e/2PACX-1vSBYQ57vlEJYa2t-' +
  'tDg7l0H3625fjrPSThbCRN2bt1BeJguD24SBfe9Rp6j5lR6dV1p4NR3YWpW3yh1/pub');


export default class ChiroSearch extends React.Component {

  static propTypes = {
    router: routerShape.isRequired
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
    missionStatement
  } = {}) => {
    setTitle(null);
    return <>
      <Banner
       bgImage={banner ? getFullLink(`images/${banner.image}`) : undefined}>
        <Banner.Title as="h2">
          {banner ? <Markdown inline>{banner.title}</Markdown> : null}
        </Banner.Title>
        <Banner.Subtitle>
          {banner ? <p><Markdown inline>{banner.subtitle}</Markdown></p> : null}
          <p>
            <Button
             size="huge"
             as={Link} to="/page/covid-review/"
             className={style['learn-more']}>
              Learn more
              <Icon
               className={style['learn-more-icon']}
               name="arrow right" />
            </Button>
          </p>
        </Banner.Subtitle>
        <Banner.Sidebar>
          <BasicTOC className={style['scroll-toc']}>
            {banner ?
              <Markdown inline>{banner.menuContent}</Markdown> :
              <Loader active />}
          </BasicTOC>
        </Banner.Sidebar>
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
      <section className={style['home-section']}>
        <H2 disableAnchor>Updates</H2>
        {updates ?
          <div className={style['scrollable']}>
            <Markdown
             escapeHtml={false}
             referenceHeadingTagLevel={3}
             disableHeadingTagAnchor>
              {updates}
            </Markdown>
          </div> :
          <Loader active />}
      </section>
      <section className={style['home-section']}>
        <H2 disableAnchor>Mission Statement</H2>
        {missionStatement ?
          <Markdown>{missionStatement}</Markdown> :
          <Loader active />}
      </section>
      <section className={style['home-section']}>
        <H2 disableAnchor>Knowledge pages</H2>
        <List horizontal className={style['list-edu-pages']}>
          <List.Item>
            <Link to="/compound-list/" className={style['section-link']}>
              <List.Content>
                <img src={imageRemdesivir} alt="Drugs" />
                <List.Header>Drugs</List.Header>
              </List.Content>
            </Link>
          </List.Item>
          <List.Item>
            <Link to="/compound-target-list/" className={style['section-link']}>
              <List.Content>
                <img src={image3CL} alt="Drug Targets" />
                <List.Header>Drug Targets</List.Header>
              </List.Content>
            </Link>
          </List.Item>
          <List.Item>
            <Link to="/virus-list/" className={style['section-link']}>
              <List.Content>
                <img src={imageSARS2} alt="Viruses" />
                <List.Header>Viruses</List.Header>
              </List.Content>
            </Link>
          </List.Item>
          <List.Item>
            <Link to="/cells-list/" className={style['section-link']}>
              <List.Content>
                <img src={imagePetriDish} alt="Cell lines" />
                <List.Header>Cell lines</List.Header>
              </List.Content>
            </Link>
          </List.Item>
          <List.Item>
            <Link to="/animal-model-list/"
             className={style['section-link']}>
              <List.Content>
                <img src={imageMouse} alt="Animal models" />
                <List.Header>Animal models</List.Header>
              </List.Content>
            </Link>
          </List.Item>
          <List.Item>
            <a
             href={URL_PK_NOTES}
             target="_blank"
             rel="noopener noreferrer"
             className={style['section-link']}>
              <List.Content>
                <img src={imagePK} alt="PK" />
                <List.Header>PK notes</List.Header>
              </List.Content>
            </a>
          </List.Item>
          <List.Item>
            <Link to="/cell-culture-measurement-list/"
             className={style['section-link']}>
              <List.Content>
                <img src={imageMeasurement} alt="Measurements" />
                <List.Header>Measurements</List.Header>
              </List.Content>
            </Link>
          </List.Item>
          <List.Item>
            <Link to="/clinical-trials/" className={style['section-link']}>
              <List.Content>
                <img src={imageClinicalTrial} alt="Clinical Trials" />
                <List.Header>Clinical Trials</List.Header>
              </List.Content>
            </Link>
          </List.Item>
          <List.Item>
            <Link to="/article-list/" className={style['section-link']}>
              <List.Content>
                <img src={imageReferences} alt="References" />
                <List.Header>References</List.Header>
              </List.Content>
            </Link>
          </List.Item>
        </List>
      </section>
      <Subscribe />
    </>;
  }

  render() {
    const promise = loadPage('home');

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
