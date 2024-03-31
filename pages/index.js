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

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import '@fortawesome/fontawesome-free'
import {library} from '@fortawesome/fontawesome-svg-core'
import {far} from '@fortawesome/free-regular-svg-icons'
import {fas} from '@fortawesome/free-solid-svg-icons'
import {fab} from '@fortawesome/free-brands-svg-icons'
library.add(far,fas,fab);

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

const MidContainer = styled.div`
    display: flex;
    justify-content: space-between;
    height: 70vh;
    border: 1px solid green;
    padding: 10px;
    margin: 1px;
`;

const PlaceHolder = styled.div`
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
    const initialMessage = useFetchmessage(baseUrl, selectedMessadeId, textHasChanged, setTextHasChanged);

    const checkChangeSelectedMessadeId = (message, ticketid, setSelectedMessageId, setSelectedTicketId, textHasChanged, setTextHasChanged) => {
        console.log('checkChangeSelectedMessadeId: ', message);
        if (selectedMessadeId === message.comment_id) {
            return;
        }
        if (textHasChanged) {
            const confirmChange = window.confirm('Are you sure you want to leave without saving the message?');
            if (!confirmChange) {
                return;
            }
            setTextHasChanged(false);
        }
        setSelectedMessageId(message.comment_id);
        setSelectedTicketId(ticketid);
    }

    const [markdown, setMarkdown] = useState(initialMessage.content);
    useEffect(() => {
        if (initialMessage.saved === true ) {
            setMarkdown(initialMessage.saved_text);
        } else {
            setMarkdown(initialMessage.content);
        }
    }, [initialMessage]);

    const handleInputChange = (event) => {
        setMarkdown(event.target.value);
        setTextHasChanged(true);
    };
                
    const handleToolbarClick = (type) => {
        switch (type) {
            case 'Save':
                console.log('SAVING MESSAGE');
                useSaveMessage(baseUrl, selectedMessadeId, markdown, setTextHasChanged);
                break;
            case 'Restore':
                console.log('RESTORING MESSAGE: ' + selectedMessadeId);
                setMarkdown(initialMessage.content);
                setTextHasChanged(true);
                break;
            case 'Delete':
                console.log('DELETING MESSAGE');
                setMarkdown('');
                useSaveMessage(baseUrl, selectedMessadeId, '', setTextHasChanged);
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
    
    const useSaveMessage = (url, selectedMessadeId, markdown, setTextChanged) => {
            const saveMessage = async () => {
            try {
                console.log('saveMessage url: ' + url + '/message/' + selectedMessadeId + '/save');
                console.log('saveMessage markdown: ' + markdown);
                const response = await axios.post(url + '/message/' + selectedMessadeId + '/save', { text: markdown });
                console.log('saveMessage response: ', response);
                setTextChanged(false);
            } catch (error) {
                console.error('Error saving message:', error);
            }
        }
        saveMessage();
    }

    const DeletedIcon = () => {
        return (
            <><FontAwesomeIcon icon="fa-solid fa-trash-can" style={{ color: 'green' }} /><span> </span></>
        );
    };
    const SavedIcon = () => {
        return (
            <><FontAwesomeIcon icon="fa-solid fa-check-double" style={{ color: 'green' }} /><span> </span></>
        );
    };

    const Conversations = () => {
        return (
            <ListConversations>
                {listTickets.map((ticket, ticketidx) => (
                    <li
                        style={{ backgroundColor: ticketidx % 2 === 0 ? '#f5f5f5' : '#e0e0e0' }}
                        key={ticket.id}
                        // onClick={() => handleTicketClick(ticket.id)}
                    >
                        {ticket.id} - {ticket.subject}
                        {(
                            <ul>
                                {ticket.messages.map((message, messageidx) => {
                                    if (!message.comment_id) {
                                        return null; // Skip the element if comment_id does not exist
                                    }
                                    return (
                                        <li 
                                            key={message.comment_id}
                                            style={{
                                                backgroundColor: message.comment_id === selectedMessadeId ? 'yellow' :
                                                    message.deleted ? '#C0C0C0' :
                                                    message.saved ? '#F5F5F5' :
                                                    messageidx % 2 === 0 ? '#B2DFDB' : '#FFB6C1'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Selected message: ' + message.comment_id);
                                                checkChangeSelectedMessadeId(message, ticket.id, setSelectedMessageId, setSelectedTicketId, textHasChanged, setTextHasChanged);
                                            }}
                                        >
                                            {message.deleted === true && <DeletedIcon />}
                                            {message.deleted !== true && message.saved === true && <SavedIcon />}
                                            {message.comment_id} - {message.short}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </li>
                ))}
            </ListConversations>
        );
};

    return (
        <EditorContainer>
            <MidContainer style={{height: 20 + 'vh'}}>
            <PlaceHolder style={{ width: "100%" }}>
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
                                    <div>Need saving: {textHasChanged ? "True" : "False"}</div>
                                    <div>Is deleted: {initialMessage.saved_text ? "True" : "False"}</div>
                                    </>
                                )
                            ))
                        )
                    ))}
                </PlaceHolder>
            </MidContainer>
            <MidContainer>
                <PlaceHolder style={{ width: "30%" }}>
                    <Conversations/>
                </PlaceHolder>
                <PlaceHolder>
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
                </PlaceHolder>
                <PlaceHolder>
                    <Toolbar>
                        <ToolbarButton>Original text: {selectedTicketId} / {selectedMessadeId}</ToolbarButton>
                    </Toolbar>
                    <TextArea
                        style={{ backgroundColor: '#C0C0C0' }}
                        name="initialText"
                        readOnly
                        value={initialMessage.content}
                    />
                </PlaceHolder>
            </MidContainer>
        </EditorContainer>
    );
};

export default MarkdownEditor;