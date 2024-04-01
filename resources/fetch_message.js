import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchmessage = (url, selectedMessage) => {
    const [message, setMessage] = useState({ content : 'Nothing to display'});
    useEffect(() => {
        const fetchmessage = async () => {
            try {
                console.log('url: ' + url + '/message/' + selectedMessage.comment_id);
                const response = await axios.get(url + '/message/' + selectedMessage.comment_id);
                setMessage(response.data);
            } catch (error) {
                console.error('Error fetching list values:', error);
            }
        };

        if (selectedMessage.comment_id === null) {
            setMessage({ content : 'Nothing to display!'});
        } else {
            fetchmessage();
        }
    }, [selectedMessage]);

    console.log('useFetchmessage message: ', message);
    return message;
};

export default useFetchmessage;