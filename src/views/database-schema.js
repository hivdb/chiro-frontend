import React from 'react';
import {Header} from 'semantic-ui-react';
import setTitle from '../utils/set-title';
import schema from '../assets/images/schema-20200412_v3.svg';


export default class DatabaseSchema extends React.Component {

  render() {
    setTitle('Database Schema');

    return <article>
      <Header as="h1" dividing>Database Schema of Core Tables</Header>
      <section>
        <img src={schema} alt="Database schema of core tables" />
      </section>
    </article>;

  }

}
