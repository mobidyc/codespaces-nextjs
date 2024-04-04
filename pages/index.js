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
    height: 40px;

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

const Ticket = styled.li`
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
cursor: pointer;
`

const MarkdownEditor = () => {
    const baseUrl = 'http://127.0.0.1:5000';
    const [textHasChanged, setTextHasChanged] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState({comment_id: null});
    const [filter_tickets_saved, setFilter_tickets_saved] = useState(false);
    const listTickets = useFetchTickets(baseUrl, filter_tickets_saved);
    const initialMessage = useFetchmessage(baseUrl, selectedMessage);
    
    const checkChangeSelectedMessadeId = (message, setSelectedMessage, setSelectedTicketId, textHasChanged, setTextHasChanged) => {
        console.log('checkChangeSelectedMessadeId: ', message);
        if (selectedMessage.comment_id === message.comment_id) {
            return;
        }
        if (textHasChanged) {
            const confirmChange = window.confirm('Are you sure you want to leave without saving the message?');
            if (!confirmChange) {
                return;
            }
            setTextHasChanged(false);
        }
        console.log("changing selected message from checkChangeSelectedMessadeId to: ", message.comment_id)
        setSelectedMessage(message);
        setSelectedTicketId(message.ticketid);
    }

    const get_next_message = (selectedMessage, listTickets) => {
        let next_comment_id = null;
        let found = false;
        for (let ticket of listTickets) {
            for (let message of ticket.messages) {
                if(!message.comment_id) {
                    continue;
                }
                if (found) {
                    return message;
                }
                if (message.comment_id === selectedMessage.comment_id) {
                    found = true;
                }
            }
        }
        return null;
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
        var nextmsg = selectedMessage;
        switch (type) {
            case 'Save':
                useSaveMessage(baseUrl, selectedMessage, markdown, setTextHasChanged);
                break;
            case 'SaveNext':
                if (useSaveMessage(baseUrl, selectedMessage, markdown, setTextHasChanged)) {
                    nextmsg = get_next_message(selectedMessage, listTickets);
                    checkChangeSelectedMessadeId(nextmsg, setSelectedMessage, setSelectedTicketId, textHasChanged, setTextHasChanged);
                }
                break;
            case 'Restore':
                setMarkdown(initialMessage.content);
                setTextHasChanged(true);
                break;
            case 'Delete':
                setMarkdown('');
                if (useSaveMessage(baseUrl, selectedMessage, '', setTextHasChanged)) {
                    nextmsg = get_next_message(selectedMessage, listTickets);
                    checkChangeSelectedMessadeId(nextmsg, setSelectedMessage, setSelectedTicketId, textHasChanged, setTextHasChanged);
                }
                break;
            case 'rmpol':
                // remove any character after the string "Regards" from markdown
                var tmp_markdown = markdown;
                var idx = tmp_markdown.toLowerCase().indexOf('regards');
                if (idx !== -1) {
                    tmp_markdown = tmp_markdown.substring(0, idx + 7);
                    setTextHasChanged(true);
                }
      

                //  from markdown, on the first line, remove any character between "hi" and ","
                const idx2 = tmp_markdown.toLowerCase().indexOf('hi');
                if (idx2 !== -1) {
                    const idx3 = tmp_markdown.indexOf(',', idx2);
                    if (idx3 !== -1) {
                        tmp_markdown = tmp_markdown.substring(0, idx2 + 2) + tmp_markdown.substring(idx3);
                        setTextHasChanged(true);
                    }
                }
                const idx4 = tmp_markdown.toLowerCase().indexOf('hello');
                if (idx4 !== -1) {
                    const idx5 = tmp_markdown.indexOf(',', idx4);
                    if (idx4 !== -1) {
                        tmp_markdown = tmp_markdown.substring(0, idx4 + 5) + tmp_markdown.substring(idx5);
                        setTextHasChanged(true);
                    }
                }
                setMarkdown(tmp_markdown);
                break;
            case 'Next':
                nextmsg = get_next_message(selectedMessage, listTickets);
                checkChangeSelectedMessadeId(nextmsg, setSelectedMessage, setSelectedTicketId, textHasChanged, setTextHasChanged);
                break;
            case 'Code':
                // Get the textarea element
                const textarea = document.getElementById('#markdown');

                // Get the start and end positions of the selected text
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                
                // Get the selected text
                const selectedText = textarea.value.substring(start, end);
                
                // Remove existing backticks from the selected text
                const cleanedText = selectedText.replace(/`/g, '');

                // Surround the selected text with backticks
                const newText = cleanedText.includes('\n') ? `\n\`\`\`\n${cleanedText}\n\`\`\`\n` : `\`${cleanedText}\``;
                
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

    const useSaveMessage = (url, selectedMessage, markdown, setTextHasChanged) => {
        const saveMessage = async () => {
            try {
                console.log('saveMessage url: ' + url + '/message/' + selectedMessage.comment_id + '/save');
                const response = await axios.post(url + '/message/' + selectedMessage.comment_id + '/save', { text: markdown });
                selectedMessage.saved = true;
                if(markdown === '') {
                    selectedMessage.deleted = true;
                } else {
                    selectedMessage.deleted = false;
                }
                setTextHasChanged(false);
            } catch (error) {
                alert('Error saving message: ' + error.message);
                console.error('Error saving message:', error);
                return false;
            }
        }
        saveMessage();
        return true;
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
                <Ticket
                    style={{ backgroundColor: ticketidx % 2 === 0 ? '#f5f5f5' : '#e0e0e0' }}
                    key={ticket.id}
                    // onClick={() => handleTicketClick(ticket.id)}
                >
                    {ticket.id} - {ticket.subject}
                    {(
                        <ul>
                            {ticket.messages.map((message, messageidx) => {
                                message.ticketid = ticket.id;
                                if (!message.comment_id) {
                                    return null; // Skip the element if comment_id does not exist
                                }
                                return (
                                    <Ticket 
                                        key={message.comment_id}
                                        style={{
                                            backgroundColor: message.comment_id === selectedMessage.comment_id ? 'yellow' :
                                                message.deleted ? '#C0C0C0' :
                                                message.saved ? '#F5F5F5' :
                                                message.role === 'user' ? '#FFB6C1' :
                                                message.role === 'assistant' ? '#B2DFDB' :
                                                'purple'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            checkChangeSelectedMessadeId(message, setSelectedMessage, setSelectedTicketId, textHasChanged, setTextHasChanged);
                                        }}
                                    >
                                        {message.deleted === true && <DeletedIcon />}
                                        {message.deleted !== true && message.saved === true && <SavedIcon />}
                                        {message.comment_id} - {message.role} - {message.short}
                                    </Ticket>
                                )
                            })}
                        </ul>
                    )}
                </Ticket>
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
                    <div>Filter enabled: {filter_tickets_saved ? "True" : "False"}</div>
                    <div>TicketId: {selectedTicketId}</div>
                    <div>MessageId: {selectedMessage.comment_id}</div>
                    {listTickets.map((ticket) => (
                        ticket.id === selectedTicketId && (
                            ticket.messages.map((message) => (
                                message.comment_id === selectedMessage.comment_id && (
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
                        <ToolbarButton onClick={() => handleToolbarClick('SaveNext')}>Save & Next</ToolbarButton>
                        <ToolbarButton onClick={() => handleToolbarClick('Next')}>Next</ToolbarButton>
                        <ToolbarButton onClick={() => handleToolbarClick('Save')}>Save</ToolbarButton>
                        <ToolbarButton onClick={() => handleToolbarClick('rmpol')}>RM politesse</ToolbarButton>
                        <ToolbarButton onClick={() => handleToolbarClick('Delete')}>Delete</ToolbarButton>
                        <ToolbarButton onClick={() => handleToolbarClick('Code')}>Code</ToolbarButton>
                        <ToolbarButton onClick={() => handleToolbarClick('Restore')}>Restore</ToolbarButton>
                        <ToolbarButton onClick={() => handleToolbarClick('Next')}>Next</ToolbarButton>
                        {/* <ToolbarButton>
                            <input
                                type="checkbox"
                                checked={filter_tickets_saved}
                                onChange={(e) => setFilter_tickets_saved(e.target.checked)}
                            />
                            Toggle
                        </ToolbarButton> */}
                    </Toolbar>
                    <TextArea
                        id="#markdown"
                        name="markdown"
                        value={markdown}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.ctrlKey && e.key === 's') {
                                e.preventDefault();
                                handleToolbarClick('Save');
                            }
                        }}
                    />
                </PlaceHolder>
                <PlaceHolder>
                    <Toolbar>
                        <ToolbarButton>Original text: {selectedTicketId} / {selectedMessage.comment_id}</ToolbarButton>
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