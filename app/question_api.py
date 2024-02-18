from flask import Blueprint, jsonify, abort
from flask import jsonify, url_for
import os
from random import choice

from app.global_status import wait_for_duel_start, wait_for_question_status, update_question_status_globally
from app.models import QUESTION_STATUS
import app
question_api_bp = Blueprint('question', __name__)


@question_api_bp.route('/next')
def get_next_question():
    """
    For the current category, selects a random image in a non-duplicative manner.
    The filename of the selected image is used as the answer.

    Returns:
        dict: A JSON object containing the path to the selected image and the image's filename as the answer.
    """

    category = wait_for_duel_start()

    # Define the path to the category's image directory
    images_dir_path = f'/static/img/category/{category}/'

    # List all files in the directory
    try:
        images_list = os.listdir(images_dir_path)
    except FileNotFoundError:
        return jsonify({"error": "Category not found or no images available."})

    # Select a random image from the list
    selected_image = choice(images_list)

    # Construct the path for the selected image
    image_path = f'{images_dir_path}/{selected_image}'

    # Use the filename as the answer
    answer = selected_image.split('.')[0]  # Removes the file extension

    return jsonify({
        "image_path": image_path,
        "answer": answer
    })


@question_api_bp.route('/status')
def get_question_status():

    status = wait_for_question_status().name
    update_question_status_globally(QUESTION_STATUS.PENDING)
    return jsonify({
        "status": status,
    })


@question_api_bp.route('/status/<status>', methods=["POST"])
def update_question_status(status):

    if status.upper() == 'PASS':
        update_question_status_globally(QUESTION_STATUS.PASS)
    elif status.upper() == 'CORRECT':
        update_question_status_globally(QUESTION_STATUS.CORRECT)
    else:
        abort(400)

    return jsonify({
        "message": "Success",
    })
