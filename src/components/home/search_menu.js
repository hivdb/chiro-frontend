import React from 'react';

import { Grid, Dropdown, Form, Divider, Container } from 'semantic-ui-react';

import DOMAIN from '../config';

class SearchMenu extends React.Component {
    
  constructor(props) {
    super(props);
        
    this.state = {
      "publication type": '',
      "study type": '',
      virus: '',
      compound: '',
      target: '',
      mechanism: '',
      search_keyword: '',
      categories: []
    };
        
    this.handleChange = this.handleChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
  }
    
  componentDidMount() {
    let url = DOMAIN + '/categories';
        
    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          result = result.items;
          result = result.map((value, index) => {
            const category = value.category;
            const tags = value.tags.map((tag, index) => {
              return {
                key: index+1,
                text: tag,
                value: tag
              };
            });
            return {
              category: category,
              tags: tags
            };
          });
                
          this.setState({
            categories: result
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
        "publication type": this.state["publication type"],
        "study type": this.state["study type"],
        virus: this.state.virus,
        compound: this.state.compound,
        target: this.state.target,
        mechanism: this.state.mechanism
      });
    });
  }
    
    
  handleSearchChange(e, input) {
    this.setState({
      search_keyword: input.value
    });
  }
    
  handleSearchSubmit(e) {
    this.props.searchContent(this.state.search_keyword);
  }
    
  render() {
    const categories = this.state.categories;
        
    return (
      <Container>
        <Grid>
          {categories.map((item, index) => {
              const category = item.category;
              const tags = item.tags;
              return (
                <Grid.Row stretched key={index}>
                  <Grid.Column>
                    <Dropdown
                     name={category.toLowerCase()}
                     placeholder={category}
                     clearable
                     multiple
                     closeOnChange
                     options={tags}
                     selection
                     onChange={this.handleChange}/>
                  </Grid.Column>
                </Grid.Row>
                  );
              })}
                    
          <Divider />
                    
          <Grid.Row stretched>
            <Grid.Column>
              <Form onSubmit={this.handleSearchSubmit}>
                <Form.Field>
                  <Form.Input
                   placeholder='Search content...' 
                   onChange={this.handleSearchChange}/>
                </Form.Field>
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>

      </Container>
    );
  }
}


export default SearchMenu;