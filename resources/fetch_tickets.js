import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchTickets = (url) => {
    const [listTickets, setListValues] = useState([]);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const response = await axios.get(url + '/tickets');
                console.log('tickets: ', response);

                setListValues(response.data);
            } catch (error) {
                console.error('Error fetching list values:', error);
            }
        };

        fetchList();
    }, [url]);

    return listTickets;
};

export default useFetchTickets;