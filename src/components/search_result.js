import React from 'react';

import { List } from 'semantic-ui-react';

import Article from './article_item';


class SearchResult extends React.Component {
    
    
    render() {
        const references = this.props.references;
        const ref = references[0];
        return (
            <List>
                {
                references.map(
                    (reference, index) => {
                        return (
                            <List.Item key={index}>
                                <List.Content>
                                    <Article reference={reference}/>
                                </List.Content>
                            </List.Item>
                        );
                    }
                )
                }
            </List>
            );
    }
}

export default SearchResult;