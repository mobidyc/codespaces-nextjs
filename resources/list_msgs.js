import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchmsgs = (ticketid) => {
    const [msgs, setmsgs] = useState([]);
    
    useEffect(() => {
        const fetchmsgs = async () => {
            try {
                console.log('url: http://127.0.0.1:5001/msg_list/' + ticketid);
                if(ticketid) {
                    console.log('AXIOS');         
                    const response = await axios.get('http://127.0.0.1:5001/msg_list/' + ticketid);       
                    console.log("response: ", response.data)
                    setmsgs(response.data);
                } else {
                    setmsgs([]);
                }
            } catch (error) {
                console.error('Error fetching list values:', error);
            }
        };
        if (ticketid) {
            fetchmsgs();
        }
    }, [ticketid]);

    return msgs;
};

export default useFetchmsgs;