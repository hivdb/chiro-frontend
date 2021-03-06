import React from 'react';

import {Dropdown, Menu} from 'semantic-ui-react';

import {backendPrefix} from '../../config';

import './search_menu_horizontal.sass';

class SearchMenu extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      "study type": '',
      virus: '',
      compound: '',
      target: '',
      categories: [],
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    let url = `${backendPrefix}/categories`;

    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          this.props.updateSubHeader(result);

          result = result.items;
          result = result.map((value, index) => {
            const category = value.category;
            let tags = [{
              key: 0,
              text: 'All',
              value: 'all',
            }];
            value.tags.map((tag_item, index) => {
              const tag = tag_item[0];
              const count = tag_item[1];
              let tag_text = tag;
              if (category === 'Compound') {
                tag_text = tag_text + ' ( ' + count + ' )';
              }
              return tags.push({
                key: index + 1,
                text: tag_text,
                value: tag,
              });
            });
            return {
              category: category,
              tags: tags
            };
          });

          this.setState({
            categories: result,
          });
        },
        (error) => {
        }
      );
  }

  handleChange(e, keyword) {
    const name = keyword.name;
    const value = keyword.value;
    let update = {};

    update[name] = value;

    this.setState(update, () => {
      this.props.searchPreparedKeyword({
        "study type": this.state["study type"],
        virus: this.state.virus,
        compound: this.state.compound,
        target: this.state.target,
      });
    });
  }

  render() {
    const categories = this.state.categories;

    return (
      <Menu stackable>
        {categories.map((item, index) => {
          const category = item.category;
          const tags = item.tags;
          return (
            <Dropdown
             fluid
             key={index}
             name={category.toLowerCase()}
             placeholder={category}
             clearable
             multiple
             options={tags}
             selection
             onChange={this.handleChange}/>
          );
          })
        }
      </Menu>
    );
  }
}

export default SearchMenu;
