import threading

from app.models import QUESTION_STATUS

duel_condition = threading.Condition()
duel_category = None


def wait_for_duel_start():
    global duel_category
    with duel_condition:  # Acquire the duel_condition lock
        while duel_category is None:  # Wait for the duel_condition to become not None
            duel_condition.wait()  # Release lock and wait to be notified
        return duel_category


def start_duel_globally(category_choice):
    global duel_category
    with duel_condition:
        duel_category = category_choice  # update global category storage
        duel_condition.notify_all()  # Notify all threads waiting on this condition


question_status_condition = threading.Condition()
question_status = QUESTION_STATUS.PENDING


def wait_for_question_status():
    global question_status

    with question_status_condition:
        while question_status is QUESTION_STATUS.PENDING:
            question_status_condition.wait()
        return question_status


def update_question_status_globally(new_status):
    global question_status

    with question_status_condition:
        question_status = new_status
        question_status_condition.notify_all()

