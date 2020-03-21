import React from 'react';
import Fuse from 'fuse.js';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import capitalize from 'lodash/capitalize';
import {useQuery} from '@apollo/react-hooks';
import {Search, Grid, Header, Icon} from 'semantic-ui-react';

import searchPromptsQuery from './search-prompts.gql';

import style from './style.module.scss';


function reformQueryData(data) {
  const {compounds, viruses} = data;
  return [
    ...compounds.edges.map(
      ({node: {name, synonyms, relatedCompounds,
        drugClassName, description
      }}) => ({
        title: name,
        synonyms,
        relatedCompounds: relatedCompounds.reduce(
          (acc, {name, synonyms}) => [...acc, name, ...synonyms],
          []
        ),
        type: drugClassName,
        drugClass: drugClassName,
        description,
        category: 'compounds'
      })
    ),
    ...viruses.edges.map(
      ({node: {name, fullName, typeName, description}}) => ({
        title: name,
        fullName,
        type: typeName,
        virusType: typeName,
        description,
        category: 'viruses'
      })
    )
  ];
}


export default function ChiroSearchDataProvider({render}) {
  let {loading, error, data} = useQuery(searchPromptsQuery);
  if (loading) {
    return 'Loading ...';
  }
  else if (error) {
    return `Error: ${error.message}`;
  }
  data = reformQueryData(data);
  return <ChiroSearch data={data} />;
}


const matchKeyLabels = {
  title: 'title',
  synonyms: 'synonym',
  relatedCompounds: 'related compound',
  fullName: 'full name',
  virusType: 'virus type',
  drugClass: 'drug class'
};


function resultRenderer({title, type, description, match, matchKey}) {
  const matchKeyLabel = matchKeyLabels[matchKey];
  let titleClass = style.title;
  if (matchKey === 'title') {
    titleClass = classNames(titleClass, style['matched']);
  }
  return (
    <div
     key="content"
     className={classNames("content", style["search-result"])}>
      {match && matchKey !== 'title' ?
        <div key="match" className={style.match}>
          ({matchKeyLabel} “<strong title={match}>{match}</strong>”)
        </div> : null}
      <div key="title" className={titleClass}>{title}</div>
      <div key="type" className={style.type}>{type}</div>
      <div key="description" className={style.desc}>{description}</div>
    </div>
  );
}


function groupByCat(results) {
  return results
    .reduce((acc, {category, ...result}) => {
      if (!(category in acc)) {
        acc[category] = {name: capitalize(category), results: []};
      }
      acc[category].results.push(result);
      return acc;
    }, {});
}


class ChiroSearch extends React.Component {

  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
    }).isRequired).isRequired
  }

  constructor() {
    super(...arguments);
    const {data} = this.props;
    this.state = {
      value: '',
      open: false,
      results: groupByCat(data)
    };
    const fuseOption = {
      threshold: 0.3,
      includeMatches: true,
      keys: [
        {name: 'title', weight: 0.6},
        {name: 'synonyms', weight: 0.4},
        {name: 'relatedCompounds', weight: 0.4},
        {name: 'fullName', weight: 0.6},
        {name: 'virusType', weight: 0.2},
        {name: 'drugClass', weight: 0.2}
      ]
    };
    this.fuse = new Fuse(data, fuseOption);
  }

  updateSuggestions = (value, otherState = {}) => {
    let results;
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      const {data} = this.props;
      results = data;
    }
    else {
      results = this.fuse
        .search(trimmedValue)
        .map(({item, matches}) => ({
          ...item,
          match: matches[0].value,
          matchKey: matches[0].key
        }));
    }
    this.setState({value, results: groupByCat(results), ...otherState});
  }

  handleFocus = () => {
    this.setState({open: true});
  }

  handleBlur = () => {
    this.setState({open: false});
  }

  handleResultSelect = (e, {result}) => {
    const value = result.title;
    this.updateSuggestions(value, {open: false});
  }

  handleSearchChange = (e, {value}) => {
    this.updateSuggestions(value);
  }

  render() {
    const {value, results, open} = this.state;
    return <Grid>
      <Grid.Row centered>
        <Grid.Column width={6}>
          <Header
           className={style["search-header"]}
           textAlign="center"
           as="h2" icon>
            <Icon name="search" />
            CoVRx Search
            <Header.Subheader>
              Search experiment data for compounds and viruses.
            </Header.Subheader>
          </Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row centered>
        <Grid.Column width={6}>
          <Search
           fluid
           category
           open={open}
           className={style['search-box']}
           input={{fluid: true}}
           size="large"
           loading={false}
           onResultSelect={this.handleResultSelect}
           onSearchChange={debounce(
             this.handleSearchChange, 500, {leading: true}
           )}
           onFocus={this.handleFocus}
           onBlur={this.handleBlur}
           results={results}
           resultRenderer={resultRenderer}
           value={value}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>;
  }

}
