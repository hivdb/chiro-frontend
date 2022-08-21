import React from 'react';
import Fuse from 'fuse.js';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import {Search} from 'semantic-ui-react';
import capitalize from 'lodash/capitalize';

import LoadSuggestions from './query';
import style from './style.module.scss';


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
     className={classNames("content", style["search-suggestion"])}>
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
      acc[category].results.push({category, ...result});
      return acc;
    }, {});
}


class SearchBoxInner extends React.Component {

  static propTypes = {
    fluid: PropTypes.bool,
    size: PropTypes.oneOf([
      'mini', 'tiny', 'small', 'large', 'big', 'huge', 'massive'
    ]),
    data: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired
    }).isRequired).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  };

  static defaultProps = {
    value: ''
  };

  constructor() {
    super(...arguments);
    const {data} = this.props;
    this.state = {
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

  updateSuggestions = (value, otherState = {}, category = null) => {
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
    this.setState({results: groupByCat(results), ...otherState});
    this.props.onChange(value, category);
  };

  handleFocus = () => {
    this.setState({open: true});
  };

  handleBlur = () => {
    this.setState({open: false});
  };

  handleResultSelect = (e, {result}) => {
    const value = result.title;
    this.updateSuggestions(value, {open: false}, result.category);
  };

  handleSearchChange = (e, {value}) => {
    this.updateSuggestions(value);
  };

  render() {
    const {fluid, size, value} = this.props;
    const {results, open} = this.state;
    return (
      <Search
       {...{fluid, size}}
       category
       open={open}
       className={style['search-box']}
       input={{fluid: true}}
       loading={false}
       onResultSelect={this.handleResultSelect}
       onSearchChange={debounce(this.handleSearchChange, 500, {leading: true})}
       onFocus={this.handleFocus}
       onBlur={this.handleBlur}
       results={results}
       resultRenderer={resultRenderer}
       value={value}
      />
    );
  }

}


export default function CombinedSearchBox(props) {
  return <LoadSuggestions>
    {data => <SearchBoxInner {...props} data={data} />}
  </LoadSuggestions>;
}
