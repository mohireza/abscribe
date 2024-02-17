from datetime import datetime
from typing import List, Optional
from abscribe_backend.models.document import Document
from abscribe_backend.models.feedback_item import FeedbackItem
from abscribe_backend.models.feedback_list import FeedbackList

DUMMY_DATE = datetime(1, 1, 1)


def create_feedback_list(document_id: str, feedback_items: List[FeedbackItem]) -> FeedbackList:
    feedback_list = FeedbackList(
        doc_id=document_id, feedback_item_list=feedback_items)
    feedback_list.save()
    return feedback_list


def add_feedback_to_list(feedback_list_id: str, feedback_item: FeedbackItem) -> Optional[FeedbackList]:
    feedback_list = FeedbackList.objects(id=feedback_list_id).first()
    if feedback_list:
        feedback_list.feedback_item_list.append(feedback_item)
        feedback_list.save()
        return feedback_list
    return None


def remove_feedback_from_list(feedback_list_id: str, feedback_item_index: int) -> Optional[FeedbackItem]:
    feedback_list = FeedbackList.objects(id=feedback_list_id).first()
    if feedback_list and 0 <= feedback_item_index < len(feedback_list.feedback_item_list):
        removed_feedback = feedback_list.feedback_item_list.pop(
            feedback_item_index)
        feedback_list.save()
        return removed_feedback
    return None


def get_feedback_list_by_document(document_id: str) -> Optional[FeedbackList]:
    feedback_list = FeedbackList.objects(doc_id=document_id).first()
    return feedback_list


def get_feedback_list(feedback_list_id: str) -> Optional[FeedbackList]:
    feedback_list = FeedbackList.objects(id=feedback_list_id).first()
    return feedback_list


def delete_feedback_list(feedback_list_id: str) -> bool:
    feedback_list = FeedbackList.objects(id=feedback_list_id).first()
    if feedback_list:
        feedback_list.delete()
        return True
    return False
