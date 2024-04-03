import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchTickets = (url, filter_tickets_saved) => {
    const [listTickets, setListValues] = useState([]);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const response = await axios.get(url + '/tickets');
                if (filter_tickets_saved) {
                    var data = new Array()
                    response.data.forEach(ticket => {
                        var filtered = ticket.messages.some(message => {
                            return message.saved === true ;
                        });
                        if (!filtered) {
                            console.log("Ticket is not filtered: ", ticket);
                            data.push(ticket);
                        }
                    });
                    console.log("Tickets are filtered ", data.length);
                    setListValues(data);
                } else {
                    setListValues(response.data);
                }
            } catch (error) {
                console.error('Error fetching list values:', error);
            }
        };

        fetchList();
    }, [filter_tickets_saved]);

    return listTickets;
};

export default useFetchTickets;