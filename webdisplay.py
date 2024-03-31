import copy
from flask import Flask, render_template, request
import pandas as pd
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)


class GetTickets:
    fname = 'resources/01.2-zendesk_tickets-markdown.json'
    save_dir = 'resources/save_dir/'
    def __init__(self   ):
        self.all_tickets = self.get_dataframe()
        self.tickets = self.get_raw_json()
        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)
    
    def get_dataframe(self):
        return pd.read_json(self.fname)

    def get_raw_json(self):
        with open(self.fname, 'r') as file:
            return json.load(file)

    # Function to extract message based on ID
    def extract_message_by_id(self, row, id_num):
        for message in row:
            try:
                if message['comment_id'] == id_num:
                    return message['content']
            except:
                pass
        return None

    def get_msg_by_comment_id(self, ticket_id, comment_id):
        msg = self.all_tickets['messages'].apply(lambda x: self.extract_message_by_id(x, comment_id))

        message = {
            "text": msg[msg.notnull()].values[0],
            "saved": False,
            "saved_text": None
        }
        if os.path.exists(self.get_save_filedest(ticket_id, comment_id)):
            message["saved"] = True
            with open(self.get_save_filedest(ticket_id, comment_id), 'r') as file:
                saved_data = json.load(file)
                message["saved_text"] = saved_data['text']

        return message
    
    def get_comment_ids_by_ticket_id(self, ticket_id):
        messages = pd.DataFrame(self.all_tickets[self.all_tickets['id'] == ticket_id]['messages'].values[0])
        messages = messages[messages['comment_id'].notnull()]
        messages['comment_id'] = messages['comment_id'].astype(int)
        messages = messages[['comment_id', 'content']].values.tolist()

        res = []
        for message in messages:
            msg = message[1].replace('\n', ' ').strip()[:96] + ' ...'
            saved = os.path.exists(self.get_save_filedest(ticket_id, message[0]))
            res.append({"comment_id": message[0], "content": msg, "saved": saved})
        return res

    def get_tickets_conv(self):
        tickets = self.all_tickets[['id', 'subject']].values.tolist()
        res = []
        for ticket in tickets:
            res.append({"id": ticket[0], "subject": ticket[1]})
        return res
    
    def get_save_filedest(self, ticket_id, comment_id):
        return os.path.join(self.save_dir, f"{str(ticket_id)}-{str(comment_id)}.json")
    
    def save_ticket(self, ticket_id, comment_id, text):
        data = {
            "ticket_id": ticket_id,
            "comment_id": comment_id,
            "text": text
        }
        filedest = self.get_save_filedest(ticket_id, comment_id)
        try:
            with open(filedest, 'w') as file:
                json.dump(data, file)
        except Exception:
            return False
        return True
    
    def get_all_tickets_raw(self):
        tickets = copy.deepcopy(self.tickets)
        for ticket in tickets:
            for message in ticket['messages']:
                message['short'] = message['content'].replace('\n', ' ').strip()[:96] + ' ...'
                del message['content']

        return tickets


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
    comment_ids = a.get_comment_ids_by_ticket_id(ticket_id)
    return comment_ids

@app.route('/ticket/<int:ticket_id>/comment_id/<int:comment_id>', methods=['GET'])
def get_comment(ticket_id, comment_id):
    text = a.get_msg_by_comment_id(ticket_id, comment_id)
    return text

@app.route('/ticket/<int:ticket_id>/comment_id/<int:comment_id>/save', methods=['POST'])
def save_comment(ticket_id, comment_id):
    text = request.json['text']
    a.save_ticket(ticket_id, comment_id, text)
    return {"success": True}

@app.route('/tickets', methods=['GET'])
def all_tickets():
    return a.get_all_tickets_raw()

@app.route('/ticket/<int:ticket_id>', methods=['GET'])
def ticket(ticket_id):
    comment_ids = a.get_comment_ids_by_ticket_id(ticket_id)
    return comment_ids

@app.route('/ticket/<int:ticket_id>/<int:comment_id>', methods=['GET'])
def get_message(ticket_id, comment_id):
    text = a.get_msg_by_comment_id(ticket_id, comment_id)
    return text

@app.route('/ticket/<int:ticket_id>/<int:comment_id>/save', methods=['POST'])
def save_message(ticket_id, comment_id):
    text = request.json['text']
    a.save_ticket(ticket_id, comment_id, text)
    return {"success": True}

if __name__ == '__main__':
    app.run(debug=True)