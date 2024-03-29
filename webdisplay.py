from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    initial_text = "lorem ipsum\n mqdfjh^dfgh qsdlfùkhqsd fgqùsdifghoy qsdf qsd^f$oih \nsqdmùfqsdpmofhslkdjfgqs"
    if request.method == 'POST':
        text = request.form['text']
        return render_template('webdisplay.html', initial_text=initial_text, text=text)
    else:
        return render_template('webdisplay.html', initial_text=initial_text)

if __name__ == '__main__':
    app.run(debug=True)