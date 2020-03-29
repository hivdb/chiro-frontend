import React from 'react';
// import {contextRef} from 'react';

import {Header, Grid, Statistic} from 'semantic-ui-react';

// import SearchMenu from './components/search_menu';
import SearchMenu from '../../components/home/search_menu_horizontal';
// import SearchResult from './components/search_result';
import SearchResult from '../../components/home/search_result_table';
import DOMAIN from '../../config';


class Home extends React.Component {
  constructor(props) {
    super(props);

    const keyword_api = '/search-by-keyword';

    this.state = {
      keyword_api: keyword_api,
      references: [],
      update_time: null,
      subHeaderInfo: null,
    };

    this.handleSearchPreparedKeyword =
      this.handleSearchPreparedKeyword.bind(this);
    this.handleUpdateSubHeader =
      this.handleUpdateSubHeader.bind(this);
  }

  componentDidMount() {
    this.setState({
      update_time: new Date()
    });
  }

  handleSearchPreparedKeyword(keywords) {
    const {
      router,
      match: {
        location: {pathname}
      }
    } = this.props;

    let params = [];
    let query = {};
    for (const prop in keywords) {
      let value = keywords[prop];

      if (value && value.length > 0) {
        value = value.join(',');
        params.push(`${prop}=${value}`);
        query[prop] = value;
      }
    }

    router.push({pathname, query});
    const param_string = params.join('&');
    let url = DOMAIN + this.state.keyword_api + '?' + param_string;
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
      );
  }

  handleUpdateSubHeader(result) {
    this.setState({
      subHeaderInfo: {
        timestamp: result['update-time'],
        total_num: result['total-publications'],
      }
    });
  }

  render() {
    const subHeaderInfo = this.state.subHeaderInfo;

    return <>
      <Header as='h1' textAlign='center' block dividing>
        {subHeaderInfo &&
        <Header.Subheader>
          <span>Updated at: {subHeaderInfo.timestamp}, </span>
          <span>Total publications: {subHeaderInfo.total_num}</span>
        </Header.Subheader>
        }
      </Header>

      <Grid>
        <Grid.Row>
          <Grid.Column
           computer={14}
           mobile={13}
           >
            <SearchMenu
             searchPreparedKeyword={this.handleSearchPreparedKeyword}
             references={this.state.references}
             updateSubHeader={this.handleUpdateSubHeader}
          />
          </Grid.Column>
          <Grid.Column>
            {this.state.references.length > 0 &&
            <Statistic size="mini">
              <Statistic.Label>Results</Statistic.Label>
              <Statistic.Value>
                {this.state.references.length}
              </Statistic.Value>
            </Statistic>
          }
          </Grid.Column>
        </Grid.Row>
      </Grid>


      {this.state.references.length > 0 &&
      <SearchResult
       references={this.state.references}
       update_time={this.state.update_time}/>}

      {/* <Header
       as='h5'
       textAlign="center">
       © 2020, All Rights Reserved.
       </Header> */}

    </>;
  }
}

export default Home;
