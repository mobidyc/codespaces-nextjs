import styled from 'styled-components';


const ListConversations = styled.ul`
list-style-type: none;
height: 98%;
padding: 10px;
margin: 0;
`;

const Conversations = (listTickets) => {
    return (
        <ListConversations>
            {listTickets.map((ticket, ticketidx) => (
                <li
                    style={{ backgroundColor: ticketidx % 2 === 0 ? '#f5f5f5' : '#e0e0e0' }}
                    key={ticket.id}
                    // onClick={() => handleTicketClick(ticket.id)}
                >
                    {ticket.id} - {ticket.subject}
                    {(
                        <ul>
                            {ticket.messages.map((message, messageidx) => {
                                if (!message.comment_id) {
                                    return null; // Skip the element if comment_id does not exist
                                }
                                return (
                                    <li 
                                        key={message.comment_id}
                                        style={{ backgroundColor: message.comment_id === selectedMessadeId ? 'yellow' : (messageidx % 2 === 0 ? '#B2DFDB' : '#FFB6C1') }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('Selected message: ' + message.comment_id);
                                            setSelectedTicketId(ticket.id);
                                            setSelectedMessageId(message.comment_id);
                                        }}
                                    >
                                        {message.deleted === true && <DeletedIcon />}
                                        {message.deleted !== true && message.saved === true && <SavedIcon />}
                                        {message.comment_id} - {message.short}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </li>
            ))}
        </ListConversations>
    );
};

export default Conversations;