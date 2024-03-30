import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchmsgs = (url, ticketid, textChanged, setTextChanged) => {
    const [msgs, setmsgs] = useState([]);
    
    useEffect(() => {
        const fetchmsgs = async () => {
            try {
                console.log('url: ' + url + '/msg_list/' + ticketid);
                if(ticketid) {
                    const response = await axios.get(url + '/msg_list/' + ticketid);       
                    setmsgs(response.data);
                } else {
                    setmsgs([]);
                }
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
        if (ticketid) {
            fetchmsgs();
        }
    }, [ticketid]);

    return msgs;
};

export default useFetchmsgs;