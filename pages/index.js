/*
Create a basic markdown editor in Next.js with the following features:
- Use React hooks
- Create state for markdown with the default text "## markdown preview"
- Create a variable initial_text with the content: this is the original text
- A read only text area using 45% of the page width on the left with the content text from the variable initial_text
- A text area using 45% of the page width on the right where users can write markdown 
- Show a live preview of the markdown text as I type
- Support for basic markdown syntax like headers, bold, italics 
- Use React markdown npm package 
- The markdown text and resulting HTML should be saved in the component's state and updated in real time 
*/
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import axios from 'axios';
import useFetchList from '../resources/list_convs';
import useFetchmsgs from '../resources/list_msgs';
import useFetchmessage from '../resources/get_message';

const EditorContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 1px;
    border: 1px solid purple;
    height: calc(100vh - 4px); //2px for margin + 2 px for border
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid grey;
    margin: 1px;
    height: 20vh;
    overflow: auto;
`;

const TextAreasContainer = styled.div`
    display: flex;
    justify-content: space-between;
    height: 40vh;
    border: 1px solid green;
    padding: 10px;
    margin: 1px;
`;

const MarkdownPreviewContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px;
    border: 1px solid black;
    flex-grow: 1;
    margin: 1px;
`;

const TextAreaPlaceHolder = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 49%;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f5f5f5;
    border: 1px solid orange;
    overflow: auto;
`;

const TextArea = styled.textarea`
    height: 98%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: none;
`;

const MarkdownPreview = styled(ReactMarkdown)`
    padding: 10px;
    height: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f5f5f5;
    bottom: 0;
`;

const Toolbar = styled.div`
    display: flex;
    padding: 10px;
    border-bottom: 1px solid #ccc;
`;

const BaseToolbarButton = styled.button`
    margin-right: 10px;
    padding: 5px 10px;
    border: none;
    background-color: #f5f5f5;
`;

const ToolbarButton = styled(BaseToolbarButton)`
    border-radius: 4px;
    background-color: #f5f5f5;
    cursor: pointer;

    &:hover {
        background-color: #e0e0e0;
    }
`;

const ListConversations = styled.ul`
        list-style-type: none;
`;

const MarkdownEditor = () => {
    
    const listValues = useFetchList('http://127.0.0.1:5001/convs');
    
    const handleToolbarClick = (format) => {
        // Logic to apply the selected format to the markdown text
    };
    
    const [selectedId, setSelectedId] = useState(null);
    const sublistValues = useFetchmsgs(selectedId);
    
    const [commentId, setCommentId] = useState(null);
    const initialText = useFetchmessage(commentId);

    const [markdown, setMarkdown] = useState(initialText);
    useEffect(() => {
        setMarkdown(initialText);
    }, [initialText]);

    return (
        <EditorContainer>
            <ListContainer>
                <ListConversations>
                    {/* <div>SelectedId is: {selectedId}</div>
                    <div>CommentId is: {commentId}</div> */}
                    {listValues.map((value, index) => (
                        <li 
                            key={value.id}
                            style={{ backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#e0e0e0' }}
                            onClick={() => setSelectedId(value.id)}>
                            {value.id}: {value.subject}
                            {selectedId === value.id && (
                                <ul>
                                    {sublistValues.map((subValue, subIndex) => (
                                        <li 
                                            key={subValue.comment_id}
                                            style={{ backgroundColor: subIndex % 2 === 0 ? 'green' : 'blue' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCommentId(subValue.comment_id);
                                            }}>
                                            {subValue.comment_id}: {subValue.content}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ListConversations>
            </ListContainer>
            <TextAreasContainer>
                <TextAreaPlaceHolder>
                    <Toolbar>
                        <BaseToolbarButton>&nbsp;</BaseToolbarButton>
                    </Toolbar>
                    <TextArea
                        name="initialText"
                        readOnly
                        value={initialText}
                    />
                </TextAreaPlaceHolder>
                <TextAreaPlaceHolder>
                    <Toolbar>
                        <ToolbarButton onClick={() => handleToolbarClick('header')}>Header</ToolbarButton>
                        <ToolbarButton onClick={() => handleToolbarClick('Code')}>Code</ToolbarButton>
                    </Toolbar>
                    <TextArea
                        name="markdown"
                        value={markdown}
                    />
                </TextAreaPlaceHolder>
            </TextAreasContainer>
            <MarkdownPreviewContainer>
                <MarkdownPreview>{markdown}</MarkdownPreview>
            </MarkdownPreviewContainer>
        </EditorContainer>
    );
};

export default MarkdownEditor;