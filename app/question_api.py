from datetime import time

from flask import Blueprint, jsonify, abort, current_app
from flask import jsonify, url_for
import os
from random import choice

from app.global_status import wait_for_duel_start, wait_for_question_status, update_question_status_globally
from app.models import QUESTION_STATUS
import app

game_started = False
update_signal = {'image_url': '', 'answer': ''}
question_api_bp = Blueprint('question', __name__)
selected_images_dict = dict()


@question_api_bp.route('/next')
def get_next_question():
    """
    For the current category, selects a random image in a non-duplicative manner.
    The filename of the selected image is used as the answer.

    Returns:
        dict: A JSON object containing the path to the selected image and the image's filename as the answer.
    """
    global game_started
    game_started = True
    category = wait_for_duel_start()

    # Define the path to the category's image directory
    images_dir_path = os.path.join(current_app.root_path, 'static', 'img', 'category', category)

    try:
        images_list = os.listdir(images_dir_path)
    except FileNotFoundError:
        return jsonify({"error": "Category not found or no images available."})

    # Initialize the category in the dictionary if not already present
    if category not in selected_images_dict:
        selected_images_dict[category] = []

    # Filter out already selected images for this category
    available_images = [img for img in images_list if img not in selected_images_dict[category]]

    # Check if there are any available images
    if not available_images:
        return jsonify({"error": "No more images available."})

    # Select a random image from the available ones
    selected_image = choice(available_images)

    # Mark the image as selected for this category
    selected_images_dict[category].append(selected_image)

    # Use the filename as the answer
    answer = selected_image.split('.')[0]  # Removes the file extension

    # Generate web-accessible URL for the image
    image_url = url_for('static', filename=f'img/category/{category}/{selected_image}')
    update_signal[
        'image_url'] = f'img/category/{category}/{selected_image}'
    update_signal['answer'] = answer

    return jsonify({
        "image_url": image_url,
        "answer_text": answer
    })


@question_api_bp.route('/start-signal')
def check_start_signal():
    # global game_started
    # status = get_question_status()
    # if status == "FINISHED":
    #     game_started = False
    return jsonify({'start': game_started})


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
    elif status.upper() == "FINISHED":
        update_question_status_globally(QUESTION_STATUS.FINISHED)
    else:
        abort(400)

    return jsonify({
        "message": "Success",
    })


@question_api_bp.route('/image-update')
def image_updates():
    return jsonify({
        "image_url": url_for('static', filename=update_signal['image_url']),
        "answer_text": update_signal['answer']
    })
