import React from 'react';
import {Link, routerShape} from 'found';
import {Grid, Header, List} from 'semantic-ui-react';

import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';
import imageRemdesivir from '../../assets/images/remdesivir.png';
import imageSARS2 from '../../assets/images/sars2.png';
import imagePetriDish from '../../assets/images/petri-dish.png';
import imageMouse from '../../assets/images/mouse.png';
import imageMeasurement from '../../assets/images/measurement.png';
import imageReferences from '../../assets/images/references.png';


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

  render() {
    setTitle(null);
    return <>
      <Grid stackable className={style['home-section']}>
        <Grid.Row>
          <Grid.Column width={8} className={style['section-covid-review']}>
            <Link to="/page/covid-review/">
              <Header as="h2" textAlign="center">
                SARS-CoV-2 Antiviral Therapy
              </Header>
              <List bulleted>
                <List.Item>Mission statement</List.Item>
                <List.Item>
                  Summary of most promising antiviral compounds
                </List.Item>
              </List>
            </Link>
          </Grid.Column>
          <Grid.Column width={8} className={style['section-search']}>
            <Header as="h2" textAlign="center">
              Search
              <Header.Subheader>
                Cell culture, animal model, and clinical data
              </Header.Subheader>
            </Header>
            <InlineSearchBox
             allowEmpty
             articleValue={null}
             compoundValue={null}
             virusValue={null}
             studyTypeValue={null}
             compoundTargetValue={null}
             placeholder={'Select one...' + '\xa0'.repeat(20)}
             onChange={this.handleExpSearchBoxChange}>
              {({
                compoundTargetDropdown,
                compoundDropdown,
                virusDropdown,
                studyTypeDropdown
              }) => (
                <StatHeader>
                  {[
                    {
                      className: style['search-box'],
                      cells: [
                        {label: 'Target', value: compoundTargetDropdown},
                        {label: 'Compound', value: compoundDropdown},
                        {label: 'Virus', value: virusDropdown},
                        {label: 'Study Type', value: studyTypeDropdown},
                      ]
                    }
                  ]}
                </StatHeader>
              )}
            </InlineSearchBox>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8} className={style['section-targets']}>
            <Link to="/compound-target-list/">
              <Header as="h2" textAlign="center">Drug Targets</Header>
            </Link>
          </Grid.Column>
          <Grid.Column width={8} className={style['section-clinical-trials']}>
            <Link to="/clinical-trials/">
              <Header as="h2" textAlign="center">Clinical Trials</Header>
              <p>
                Ongoing and planned SARS-CoV-2 clinical trials of potential
                anti-coronavirus compounds annotated according to study design
                and patient population.
              </p>
            </Link>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16} className={style['section-edu-pages']}>
            <List horizontal>
              <List.Item>
                <Link to="/compound-list/">
                  <List.Content>
                    <img src={imageRemdesivir} alt="Compounds" />
                    <List.Header>Compounds</List.Header>
                  </List.Content>
                </Link>
              </List.Item>
              <List.Item>
                <Link to="/virus-list/">
                  <List.Content>
                    <img src={imageSARS2} alt="Viruses" />
                    <List.Header>Viruses</List.Header>
                  </List.Content>
                </Link>
              </List.Item>
              <List.Item>
                <Link to="/cells-list/">
                  <List.Content>
                    <img src={imagePetriDish} alt="Cell lines" />
                    <List.Header>Cell lines</List.Header>
                  </List.Content>
                </Link>
              </List.Item>
              <List.Item>
                <Link to="/animal-model-list/">
                  <List.Content>
                    <img src={imageMouse} alt="Animal models" />
                    <List.Header>Animal models</List.Header>
                  </List.Content>
                </Link>
              </List.Item>
              <List.Item>
                <Link to="/cell-culture-measurement-list/">
                  <List.Content>
                    <img src={imageMeasurement} alt="Measurements" />
                    <List.Header>Measurements</List.Header>
                  </List.Content>
                </Link>
              </List.Item>
              <List.Item>
                <Link to="/article-list/">
                  <List.Content>
                    <img src={imageReferences} alt="References" />
                    <List.Header>References</List.Header>
                  </List.Content>
                </Link>
              </List.Item>
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>;
  }

}
