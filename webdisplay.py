from flask import Flask, render_template, request
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


class GetTickets:
    fname = 'resources/01.2-zendesk_tickets-markdown.json'
    def __init__(self   ):
        self.all_tickets = self.get_dataframe()
    
    def get_dataframe(self):
        return pd.read_json(self.fname)

    # Function to extract message based on ID
    def extract_message_by_id(self, row, id_num):
        for message in row:
            try:
                if message['comment_id'] == id_num:
                    return message['content']
            except:
                pass
        return None

    def get_msg_by_comment_id(self, comment_id):
        msg = self.all_tickets['messages'].apply(lambda x: self.extract_message_by_id(x, comment_id))
        return msg[msg.notnull()].values[0]
    
    def get_comment_ids_by_ticket_id(self, ticket_id):
        messages = pd.DataFrame(self.all_tickets[self.all_tickets['id'] == ticket_id]['messages'].values[0])
        messages = messages[messages['comment_id'].notnull()]
        messages['comment_id'] = messages['comment_id'].astype(int)
        messages = messages[['comment_id', 'content']].values.tolist()

        res = []
        for message in messages:
            msg = message[1].replace('\n', ' ').strip()[:96] + ' ...'
            res.append({"comment_id": message[0], "content": msg})
        return res

    def get_tickets_conv(self):
        tickets = self.all_tickets[['id', 'subject']].values.tolist()
        res = []
        for ticket in tickets:
            res.append({"id": ticket[0], "subject": ticket[1]})
        return res


a = GetTickets()

@app.route('/', methods=['GET', 'POST'])
def index():
    initial_text = "lorem ipsum\n mqdfjh^dfgh qsdlfùkhqsd fgqùsdifghoy qsdf qsd^f$oih \nsqdmùfqsdpmofhslkdjfgqs"
    if request.method == 'POST':
        text = request.form['text']
        return render_template('webdisplay.html', initial_text=initial_text, text=text)
    else:
        return render_template('webdisplay.html', initial_text=initial_text)

@app.route('/convs', methods=['GET'])
def convs():
    return a.get_tickets_conv()

@app.route('/msg_list/<int:ticket_id>', methods=['GET'])
def msg_list(ticket_id):
    print
    comment_ids = a.get_comment_ids_by_ticket_id(ticket_id)
    return comment_ids

@app.route('/msg/<int:comment_id>', methods=['GET'])
def msg(comment_id):
    comment_ids = a.get_msg_by_comment_id(comment_id)
    return comment_ids

if __name__ == '__main__':
    app.run(debug=True)