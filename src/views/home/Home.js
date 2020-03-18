import React from 'react';
// import {contextRef} from 'react';

import './Home.css';

import 'semantic-ui-css/semantic.min.css';
import { Container, Header, Grid, Statistic } from 'semantic-ui-react';

// import SearchMenu from './components/search_menu';
import SearchMenu from '../../components/home/search_menu_horizontal';
// import SearchResult from './components/search_result';
import SearchResult from '../../components/home/search_result_table';
import DOMAIN from '../../config';


class Home extends React.Component {
  constructor(props) {
    super(props);
    
    const default_api = 'keyword_api';
    const keyword_api = DOMAIN + '/search-by-keyword';
    const search_api = DOMAIN + '/search-by-content';
    
    this.state = {
      current_api: default_api,
      keyword_api: keyword_api,
      prepared_keyword: {},
      search_api: search_api,
      content_keyword: "",
      references: [],
      update_time: null,
    };
    
    this.handleSearchPreparedKeyword = this.handleSearchPreparedKeyword.bind(this);
    this.handleSearchContent = this.handleSearchContent.bind(this);
  }

  componentDidMount() {
    let url = this.state.keyword_api;

    fetch(url)
    .then(res => res.json())
    .then(
        (result) => {
          this.setState({
            references: result['items'],
            update_time: new Date()
          });
        },
        (error) => {
        }
    )
  }
  
  handleSearchPreparedKeyword(keywords) {
    let url = this.state.keyword_api + '?';
    
    let params = [];
    for (const prop in keywords) {
      let value = keywords[prop];
      if (value) {
        params.push(`${prop}=${value}`)
      }
    }

    url += params.join('&');
    url = encodeURI(url);
    
    fetch(url)
    .then(res => res.json())
    .then(
        (result) => {
          this.setState({
            references: result['items'],
            update_time: new Date(),
          });
        },
        (error) => {
        }
    )
  }
  
  handleSearchContent(keyword) {
    let url = this.state.search_api + '?keyword=' + keyword;
    fetch(url)
    .then(res => res.json())
    .then(
        (result) => {
          this.setState({
            references: result['items'],
            update_time: new Date(),
          });
        },
        (error) => {
        }
    )
  }
  
  render() {    
    return (
      <div>
      <Container>
        <Header as='h1' textAlign='center' block>
          CoV-Rx-DB
          <Header.Subheader>
          COVID 19, Coronavirus, SARS-CoV2
          </Header.Subheader>
        </Header>
        
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <SearchMenu 
                searchPreparedKeyword={this.handleSearchPreparedKeyword}
                searchContent = {this.handleSearchContent}
                references={this.state.references}
              />
            </Grid.Column>
            <Grid.Column>
              <Statistic size="mini">
                  <Statistic.Label>Results</Statistic.Label>
                  <Statistic.Value>{this.state.references.length}</Statistic.Value>
              </Statistic>
            </Grid.Column>
          </Grid.Row>
        </Grid>


        {this.state.references.length > 0 &&
        <SearchResult references={this.state.references} update_time={this.state.update_time}/>
        }
        
        <Header as='h5' textAlign="center">© 2020, All Rights Reserved.</Header>

      </Container>  
      </div>
      );
  }
}

export default Home;
