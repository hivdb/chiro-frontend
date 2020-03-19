import React from 'react';
import _ from 'lodash'

import { Table, Label, Popup, List } from 'semantic-ui-react';

import './search_result_table.css';


class SearchResult extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            sort_column: null,
            direction: null,
            references: [],
            update_time: null,
        }
        
        this.handleSort = this.handleSort.bind(this);
    }
    
    componentDidMount() {
        this.setState({
            references: this.props.references,
            update_time: this.props.update_time,
        });
    }
    
    componentDidUpdate() {
        // this.setState({
        //     references: this.props.references,
        // });
        const update_time = this.state.update_time;
        
        if (update_time < this.props.update_time) {
            this.setState({
                references: this.props.references,
                update_time: this.props.update_time,
            });
        }
    }
    
    handleSort = (clickedColumn) => () => {
        const {sort_column, references, direction} = this.state;
        
        if (sort_column !== clickedColumn) {
            this.setState({
                sort_column: clickedColumn,
                references: _.sortBy(references, [clickedColumn]),
                direction: 'descending',
            })
            
            return
        }
        
        this.setState({
            references: references.reverse(),
            direction: direction === 'ascending' ? 'descending' : 'ascending',
        });
    }
    
    
    render() {
        const {sort_column, references, direction} = this.state;
        
        return (

            <Table celled sortable>
                <Table.Header>
                    <Table.Row textAlign='center'>
                        <Table.HeaderCell
                            sorted={sort_column === 'title' ? direction: null}
                            onClick={this.handleSort('title')}>
                                Title
                        </Table.HeaderCell>
                        {/* <Table.HeaderCell
                            sorted={sort_column === 'author' ? direction: null}
                            onClick={this.handleSort('author')}>
                            First Author
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={sort_column === 'journal_abbr' ? direction: null}
                            onClick={this.handleSort('journal_abbr')}>
                            Journal
                        </Table.HeaderCell> */}
                        <Table.HeaderCell
                            sorted={sort_column === 'author' ? direction: null}
                            onClick={this.handleSort('author')}>
                            Publish
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={sort_column === 'year' ? direction: null}
                            onClick={this.handleSort('year')}>
                            Year</Table.HeaderCell>
                        {/* <Table.HeaderCell>Links</Table.HeaderCell> */}
                        <Table.HeaderCell>
                            Tags
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Data
                        </Table.HeaderCell>
                    </Table.Row>

                </Table.Header>
                <Table.Body>
                    {references.map((reference, index) => {
                        const title = reference.title;
                        const author = reference.author;
                        // const authors = reference.authors;
                        const journal = reference.journal_abbr;
                        const acronym = journal.split(' ').join('');
                        // const abstract = reference.abstract;
                        const year = reference.year;
                        // const pmid = reference.pmid;
                        const pubmed_url = reference.pubmed_url;
                        // const pmcid = reference.pmcid;
                        const pmc_url = reference.pmc_url;
                        // const doi = reference.doi;
                        const doi_url = reference.doi_url;
                        // const contents = reference.contents;
                        let tags = reference.tags;
                        let more_tags = false;
                        if (tags.length > 5) {
                            tags = tags.slice(0, 5);
                            more_tags = true;
                        } else {
                            more_tags = false;
                        }
                            
                        const exp_tags = reference.exp_tags;
                        
                        const title_url = doi_url ? doi_url: (pubmed_url ? pubmed_url : (pmc_url ? pmc_url : ''));
                        
                        return (
                            <Table.Row key={index}>
                                <Table.Cell
                                    width={5}
                                    verticalAlign='top'>
                                        <Popup 
                                            content="Go to publisher page."
                                            size='mini'
                                            position='bottom center'
                                            trigger={
                                            <a href={title_url} target="_blank" rel="noopener noreferrer">
                                                {title}
                                            </a>
                                        } />
                                </Table.Cell>
                                <Table.Cell
                                    width={1}
                                    verticalAlign='top'>
                                    <p>{author}</p>
                                    <Popup
                                        content={journal} trigger={<p>{acronym}</p>}
                                    />
                                    
                                </Table.Cell>
                                <Table.Cell
                                    width={1}
                                    verticalAlign='top'>
                                    {year}
                                </Table.Cell>
                                {/* <Table.Cell>
                                    <List>
                                        {pmid &&
                                        <List.Item as="a" href={pubmed_url} target="_blank">
                                            PubMed
                                        </List.Item>
                                        }
                                        {pmcid &&
                                        <List.Item as="a" href={pmc_url} target="_blank">
                                            PMC
                                        </List.Item>
                                        }
                                        {doi &&
                                        <List.Item as="a" href={doi_url} target="_blank">
                                            DOI
                                        </List.Item>
                                        }
                                    </List>
                                </Table.Cell> */}
                                <Table.Cell
                                    width={3}
                                    verticalAlign='top'>
                                    <Label.Group size="tiny">
                                        {tags && tags.map((tag, index) => {
                                            return (
                                                <Label key={index} size="tiny">{tag}</Label>
                                            );
                                        })}
                                        {more_tags &&
                                        "..."
                                        }
                                    </Label.Group>
                                </Table.Cell>
                                
                                {exp_tags &&  
                                <Table.Cell
                                    width={1}
                                    verticalAlign='top'>
                                        <List divided size='mini'>
                                        {exp_tags.map((tag, index) => {
                                            return (
                                                <List.Item key={index} size='mini'>
                                                <Popup content='In progress.' size='mini' trigger={
                                                    <a size='mini' onClick={e=>e.preventDefault()}>
                                                        {tag}
                                                    </a>
                                                    }
                                                />
                                                </List.Item>
                                            );
                                        })}
                                        </List>
                                </Table.Cell>
                                }
                            </Table.Row>
                        );
                    })}
                    
                </Table.Body>
            </Table>
        )
    }
}

export default SearchResult;