import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchmessage = (commentId, textChanged, setTextChanged) => {
    const [message, setMessage] = useState('This is the initial text');
    
    useEffect(() => {
        const fetchmessage = async () => {
            try {
                console.log('url: http://127.0.0.1:5001/msg/' + commentId);
                const response = await axios.get('http://127.0.0.1:5001/msg/' + commentId);
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