import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchList = (url) => {
    const [listValues, setListValues] = useState([]);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const response = await axios.get(url);

                setListValues(response.data);
            } catch (error) {
                console.error('Error fetching list values:', error);
            }
        };

        fetchList();
    }, [url]);

    return listValues;
};

export default useFetchList;