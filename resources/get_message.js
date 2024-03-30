import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchmessage = (url, ticket_id, commentId, textChanged, setTextChanged) => {
    const [message, setMessage] = useState('This is the initial text');
    
    useEffect(() => {
        const fetchmessage = async () => {
            try {
                console.log('url: ' + url + '/ticket/' + ticket_id + '/comment_id/' + commentId);
                const response = await axios.get(url + '/ticket/' + ticket_id + '/comment_id/' + commentId);
                setMessage(response.data);
            } catch (error) {
                console.error('Error fetching list values:', error);
            }
        };
        if (textChanged) {
            const confirmChange = window.confirm('Are you sure you want to leave without saving the message?');
            if (!confirmChange) {
                return;
            }
            setTextChanged(false);
        }
        if (commentId) {
            fetchmessage();
        } else {
            setMessage('This is the initial text');
        }
        console.log('MMMM message: ', message);
    }, [commentId]);
    
    return message;
};

export default useFetchmessage;