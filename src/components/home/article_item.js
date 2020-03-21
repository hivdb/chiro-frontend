import React from 'react';

import {
  Segment,
  Header,
  List,
  Accordion,
  Icon,
  Divider,
  Message } from 'semantic-ui-react';


class Article extends React.Component {
    
  constructor(props) {
    super(props);
    
    this.state = {
      activeAbstract: false,
      activeContent: false
    };
    
    this.handleAbstract = this.handleAbstract.bind(this);
    this.handleContent = this.handleContent.bind(this);
  }
    
  handleAbstract() {
    const activeAbstract = this.state.activeAbstract;
    this.setState({
      activeAbstract: !activeAbstract
    });
  }

  handleContent() {
    const activeContent = this.state.activeContent;
    this.setState({
      activeContent: !activeContent
    });
  }
    
  render() {
    const reference = this.props.reference;
    if (!reference) {
      return "";
    }
        
    const title = reference.title;
    const authors = reference.authors;
    const journal = reference.journal_abbr;
    const abstract = reference.abstract;
    const pmid = reference.pmid;
    const pubmed_url = reference.pubmed_url;
    const pmcid = reference.pmcid;
    const pmc_url = reference.pmc_url;
    const doi = reference.doi;
    const doi_url = reference.doi_url;
    const contents = reference.contents;
        
        
    const activeAbstract = this.state.activeAbstract;
    const activeContent = this.state.activeContent;
        
    return (
      <Segment>
        <Header as="h3">
          {title}
        </Header>
                
        <Divider />
        
        <p>
            Authors: {authors}
        </p>
        <p>
            Journal: {journal}
        </p>
                
        <Divider />
        
        <Accordion fluid styled>
          <Accordion.Title
           active={activeAbstract}
           onClick={this.handleAbstract}>
            Abstract
            <Icon name="dropdown" />
          </Accordion.Title>
          <Accordion.Content active={activeAbstract}>
            <p>{abstract}</p>
          </Accordion.Content>
        </Accordion>
        
        <Divider />
                
        { contents &&
        <Accordion fluid styled>
          <Accordion.Title
           active={activeContent}
           onClick={this.handleContent}>
            Content
            <Icon name="dropdown" />
          </Accordion.Title>
          <Accordion.Content active={activeContent}>
            <List divided relaxed>
              <List.Item>
                {contents.map((content, index) => {
                  return (
                    <List.Content>
                      <Message>
                        <p>{content[0]}</p>
                      </Message>
                    </List.Content>
                    );
                  })}
              </List.Item>
            </List>
          </Accordion.Content>
        </Accordion>
      }
                
        {contents && <Divider />}
                
                
        <List bulleted horizontal>
          {pmid &&
          <List.Item as="a" href={pubmed_url} target="_blank">
              Pub med: {pmid}
          </List.Item>
          }
          {pmcid &&
          <List.Item as="a" href={pmc_url} target="_blank">
              PMC: {pmcid}
          </List.Item>
          }
          {doi &&
          <List.Item as="a" href={doi_url} target="_blank">
              DOI: {doi}
          </List.Item>
          }
        </List>
      </Segment>
    );
  }
}

export default Article;