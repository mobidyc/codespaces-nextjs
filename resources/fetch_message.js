import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchmessage = (url, commentId, textChanged, setTextChanged) => {
    const [message, setMessage] = useState({ content : 'Nothing to display'});
    useEffect(() => {
        const fetchmessage = async () => {
            try {
                console.log('url: ' + url + '/message/' + commentId);
                const response = await axios.get(url + '/message/' + commentId);
                setMessage(response.data);
            } catch (error) {
                console.error('Error fetching list values:', error);
            }
        };
        // if (textChanged) {
        //     const confirmChange = window.confirm('Are you sure you want to leave without saving the message?');
        //     if (!confirmChange) {
        //         return;
        //     }
        //     setTextChanged(false);
        // }
        if (commentId === null) {
            setMessage({ content : 'Nothing to display!'});
        } else {
            fetchmessage();
        }
    }, [commentId]);

    console.log('useFetchmessage message: ', message);
    return message;
};

export default useFetchmessage;