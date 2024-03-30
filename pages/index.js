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
    height: 60vh;
    border: 1px solid green;
    padding: 10px;
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
        height: 98%;
        padding: 10px;
        margin: 0;
`;

const MarkdownEditor = () => {
    const baseUrl = 'http://127.0.0.1:5000';
    const [textChanged, setTextChanged] = useState(false);
    const listValues = useFetchList(baseUrl);
    
    const [selectedId, setSelectedId] = useState(null);
    const sublistValues = useFetchmsgs(baseUrl, selectedId, textChanged, setTextChanged);
    
    const [commentId, setCommentId] = useState(null);
    const initialText = useFetchmessage(baseUrl, selectedId, commentId, textChanged, setTextChanged);

    const [markdown, setMarkdown] = useState(initialText);
    useEffect(() => {
        console.log('initialText USEEZFFECT: ', initialText)
        if (initialText.saved) {
            setMarkdown(initialText.saved_text);
        } else {
            setMarkdown(initialText.text);
        }
    }, [initialText]);

    const handleInputChange = (event) => {
        console.log('Entering handleInputChange');
        setMarkdown(event.target.value);
        setTextChanged(true);
    };

    const handleToolbarClick = (type) => {
        switch (type) {
            case 'Save':
                console.log('SAVING MESSAGE');
                useSaveMessage(baseUrl, selectedId, commentId, markdown, setTextChanged);
                break;
            case 'Restore':
                console.log('RESTORING MESSAGE: ' + selectedId + ' / ' + commentId);
                setMarkdown(initialText.text);
                setTextChanged(true);
                break;
            case 'Delete':
                console.log('DELETING MESSAGE');
                setMarkdown('');
                useSaveMessage(baseUrl, selectedId, commentId, '', setTextChanged);
                setTextChanged(false);
                break;
            case 'Code':
                // Get the textarea element
                const textarea = document.getElementById('#markdown');

                // Get the start and end positions of the selected text
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;

                // Get the selected text
                const selectedText = textarea.value.substring(start, end);

                // Surround the selected text with backticks
                const newText = selectedText.includes('\n') ? `\n\`\`\`\n${selectedText}\n\`\`\`\n` : `\`${selectedText}\``;

                // Replace the selected text with the new text
                setMarkdown(textarea.value.substring(0, start) + newText + textarea.value.substring(end));

                // Update the cursor position
                textarea.selectionStart = start;
                textarea.selectionEnd = start + newText.length;
                setTextChanged(true);
                break;
            default:
                break;
        }
    };

    const useSaveMessage = (url, ticket_id, commentId, markdown, setTextChanged) => {
        const saveMessage = async () => {
            try {
                console.log('url: ' + url + '/ticket/' + ticket_id + '/comment_id/' + commentId + '/save');
                const response = await axios.post(url + '/ticket/' + ticket_id + '/comment_id/' + commentId + '/save', { text: markdown });
                console.log('response: ', response);
                setTextChanged(false);
            } catch (error) {
                console.error('Error saving message:', error);
            }
        }
        saveMessage();
    }


    return (
        <EditorContainer>
            <ListContainer>
                <ListConversations>
                    {listValues.map((value, index, textChanged) => (
                        <li 
                            key={value.id}
                            style={{ backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#e0e0e0' }}
                            onClick={() => setSelectedId(selectedId === value.id ? null : value.id)}>
                            {value.id}: {value.subject}
                            {selectedId === value.id && (
                                <ul>
                                    {sublistValues.map((subValue, subIndex, textChanged) => (
                                        <li 
                                            key={subValue.comment_id}
                                            style={{ backgroundColor: subIndex % 2 === 0 ? '#B2DFDB' : '#FFB6C1' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCommentId(subValue.comment_id);
                                                e.stopPropagation();
                                                const previousBackgroundColor = e.target.style.backgroundColor;
                                                const elements = document.querySelectorAll('li');
                                                elements.forEach((element) => {
                                                    if (element.style.backgroundColor === 'yellow') {
                                                        element.style.backgroundColor = previousBackgroundColor;
                                                    }
                                                });
                                                e.target.style.backgroundColor = 'yellow';
                                            }}>
                                            {subValue.saved && <span style={{ color: 'green' }}>✓ </span>}{subValue.comment_id}: {subValue.content}
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
                    <ToolbarButton>Original text: {selectedId} / {commentId}</ToolbarButton>
                    </Toolbar>
                    <TextArea
                        style={{ backgroundColor: '#C0C0C0' }}
                        name="initialText"
                        readOnly
                        value={initialText.text}
                    />
                </TextAreaPlaceHolder>
                <TextAreaPlaceHolder>
                    <Toolbar>
                        <ToolbarButton onClick={() => handleToolbarClick('Save')}>Save</ToolbarButton>
                        <ToolbarButton onClick={() => handleToolbarClick('Restore')}>Restore</ToolbarButton>
                        <ToolbarButton onClick={() => handleToolbarClick('Delete')}>Delete</ToolbarButton>
                        <ToolbarButton onClick={() => handleToolbarClick('Code')}>Code</ToolbarButton>
                    </Toolbar>
                    <TextArea
                        id="#markdown"
                        name="markdown"
                        value={markdown}
                        onChange={handleInputChange}
                    />
                </TextAreaPlaceHolder>
            </TextAreasContainer>
            <TextAreasContainer style={{height: 30 + 'vh'}}>
                <TextAreaPlaceHolder>
                <Toolbar>
                <ToolbarButton>Result:</ToolbarButton>
                </Toolbar>
                    <TextArea
                        name="result"
                        readOnly
                        value={markdown}
                        style={{ backgroundColor: '#C0C0C0' }}
                    />
                </TextAreaPlaceHolder>
            </TextAreasContainer>
        </EditorContainer>
    );
};

export default MarkdownEditor;