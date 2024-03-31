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
import useFetchTickets from '../resources/fetch_tickets';
import useFetchmessage from '../resources/fetch_message';

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
    const [textHasChanged, setTextHasChanged] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [selectedMessadeId, setSelectedMessageId] = useState(null);
    const listTickets = useFetchTickets(baseUrl);
    const initialMessage = useFetchmessage(baseUrl, selectedTicketId, selectedMessadeId, textHasChanged, setTextHasChanged);
    
    const [markdown, setMarkdown] = useState(initialMessage);
    useEffect(() => {
        if (initialMessage.saved) {
            setMarkdown(initialMessage.saved_text);
        } else {
            setMarkdown(initialMessage.text);
        }
    }, [initialMessage]);

    const handleInputChange = (event) => {
        console.log('Entering handleInputChange');
        setMarkdown(event.target.value);
        setTextHasChanged(true);
    };
                
    const handleToolbarClick = (type) => {
        switch (type) {
            case 'Save':
                console.log('SAVING MESSAGE');
                useSaveMessage(baseUrl, selectedTicketId, selectedMessadeId, markdown, setTextHasChanged);
                break;
            case 'Restore':
                console.log('RESTORING MESSAGE: ' + selectedTicketId + ' / ' + selectedMessadeId);
                setMarkdown(initialMessage.text);
                setTextHasChanged(true);
                break;
            case 'Delete':
                console.log('DELETING MESSAGE');
                setMarkdown('');
                useSaveMessage(baseUrl, selectedTicketId, selectedMessadeId, '', setTextHasChanged);
                setTextHasChanged(false);
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
                setTextHasChanged(true);
                break;
            default:
                break;
        }
    };
    
    const useSaveMessage = (url, selectedTicketId, selectedMessadeId, markdown, setTextChanged) => {
            const saveMessage = async () => {
            try {
                console.log('url: ' + url + '/ticket/' + ticket_id + '/' + commentId + '/save');
                const response = await axios.post(url + '/ticket/' + ticket_id + '/' + commentId + '/save', { text: markdown });
                console.log('response: ', response);
                setTextChanged(false);
            } catch (error) {
                console.error('Error saving message:', error);
            }
        }
        saveMessage();
    }
    
    const handleTicketClick = (ticketId) => {
        setSelectedTicketId(ticketId);
    };


    return (
        <EditorContainer>
            <ListContainer>
                <ListConversations>
                    {listTickets.map((ticket, ticketidx) => (
                        <li
                            style={{ backgroundColor: ticketidx % 2 === 0 ? '#f5f5f5' : '#e0e0e0' }}
                            key={ticket.id}
                            onClick={() => handleTicketClick(selectedTicketId === ticket.id ? null : ticket.id)}
                        >
                            {ticket.id} - {ticket.subject}
                            {ticket.id === selectedTicketId && (
                                <ul>
                                    {ticket.messages.map((message, messageidx) => (
                                        <li 
                                            key={message.comment_id}
                                            style={{ backgroundColor: message.comment_id === selectedMessadeId ? 'yellow' : (messageidx % 2 === 0 ? '#B2DFDB' : '#FFB6C1') }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Selected message: ' + message.comment_id);
                                                setSelectedMessageId(message.comment_id);
                                            }}
                                        >
                                        {message.comment_id} - {message.short}</li>
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
                        <ToolbarButton>Original text: {selectedTicketId} / {selectedMessadeId}</ToolbarButton>
                    </Toolbar>
                    <TextArea
                        style={{ backgroundColor: '#C0C0C0' }}
                        name="initialText"
                        readOnly
                        value={initialMessage.text}
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
                <TextAreaPlaceHolder>
                <Toolbar>
                <ToolbarButton>Info:</ToolbarButton>
                </Toolbar>
                    <div>TicketId: {selectedTicketId}</div>
                    <div>MessageId: {selectedMessadeId}</div>
                    {listTickets.map((ticket) => (
                        ticket.id === selectedTicketId && (
                            ticket.messages.map((message) => (
                                message.comment_id === selectedMessadeId && (
                                    <>
                                    <div>Short: {message.short}</div>
                                    <div>Has a saved resource: {initialMessage.saved ? "True" : "False"}</div>
                                    <div>Need saving: {textHasChanged ? "true" : "False"}</div>
                                    <div>Is deleted: {initialMessage.saved_text === '' ? "True" : "False"}</div>
                                    </>
                                )
                            ))
                        )
                    ))}
                </TextAreaPlaceHolder>
            </TextAreasContainer>
        </EditorContainer>
    );
};

export default MarkdownEditor;