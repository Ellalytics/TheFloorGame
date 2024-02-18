from flask import Flask, jsonify, render_template

from app import models
from app.global_status import start_duel_globally
from app.question_api import question_api_bp

app = Flask(__name__)

app.register_blueprint(question_api_bp, url_prefix='/question')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/judge')
def judge():
    return render_template('judge.html')


@app.route('/category/start/<category>')
def start_category(category):
    start_duel_globally(category)
    response_data = {
        "status": "success"
    }
    return jsonify(response_data)


@app.route('/category/cancel')
def cancel_category():
    start_duel_globally(None)
    response_data = {
        "status": "success"
    }
    return jsonify(response_data)
