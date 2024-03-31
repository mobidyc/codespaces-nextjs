import copy
from flask import Flask, render_template, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)


class GetTickets:
    fname = 'resources/01.2-zendesk_tickets-markdown.json'
    save_dir = 'resources/save_dir/'
    def __init__(self   ):
        self.tickets = self.get_raw_json()
        self.check_save_exists()

    def get_raw_json(self):
        with open(self.fname, 'r') as file:
            return json.load(file)
    
    def check_save_exists(self):
        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)
        for ticket in self.tickets:
            for message in ticket['messages']:
                if "comment_id" not in message:
                    continue
                saved_msg = self.get_msg_by_comment_id(message['comment_id'])
                message['saved'] = "saved" in saved_msg and saved_msg['saved']
                message['deleted'] = "saved_text" in saved_msg and saved_msg['saved_text'] == ''

        return self.tickets
    
    def get_save_filedest(self, ticket_id, comment_id):
        return os.path.join(self.save_dir, f"{str(ticket_id)}-{str(comment_id)}.json")

    def get_msg_by_comment_id(self, comment_id):
        # search the original message
        original = None
        ticket_id = None
        for ticket in self.tickets:
            for message in ticket['messages']:
                if 'comment_id' in message and message['comment_id'] == comment_id:
                    ticket_id = ticket['id']
                    original = message
                    break
        if not original:
            print("Original Message not found")
            return False

        if os.path.exists(self.get_save_filedest(ticket_id, comment_id)):
            original["saved"] = True
            with open(self.get_save_filedest(ticket_id, comment_id), 'r') as file:
                saved_data = json.load(file)
                original["saved_text"] = saved_data['text']

        return original

    def save_ticket(self, comment_id, text):
        data = {
            "comment_id": comment_id,
            "text": text
        }

        # search the original message
        original = None
        ticket_id = None
        for ticket in self.tickets:
            for message in ticket['messages']:
                if "comment_id" not in message:
                    continue
                if message['comment_id'] == comment_id:
                    ticket_id = ticket['id']
                    original = message
                    break
        if not original:
            print("Original Message not found")
            return False
        if original['content'] == text:
            print("No changes")
            return False
        
        filedest = self.get_save_filedest(ticket_id, comment_id)
        try:
            with open(filedest, 'w') as file:
                json.dump(data, file)
        except Exception:
            return False

        # Update the status
        original['saved'] = True
        if text == '':
            original['deleted'] = True
        else:
            # In case of a restoration
            original['deleted'] = False

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

@app.route('/tickets', methods=['GET'])
def all_tickets():
    return a.get_all_tickets_raw()

@app.route('/ticket/<int:ticket_id>', methods=['GET'])
def ticket(ticket_id):
    comment_ids = a.get_comment_ids_by_ticket_id(ticket_id)
    return comment_ids

@app.route('/message/<int:comment_id>', methods=['GET'])
def get_message(comment_id):
    text = a.get_msg_by_comment_id(comment_id)
    return text

@app.route('/message/<int:comment_id>/save', methods=['POST'])
def save_message(comment_id):
    text = request.json['text']
    print(f"Saving message {comment_id} with text: {text}")
    a.save_ticket(comment_id, text)
    return {"success": True}

if __name__ == '__main__':
    app.run(debug=True)