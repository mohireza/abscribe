from abscribe_backend.models.feedback_item_version import FeedbackItemVersion
from abscribe_backend.models.feedback_list import FeedbackList
from abscribe_backend.services.document_service import get_document
from abscribe_backend.services.feedback_list_service import add_feedback_to_list, remove_feedback_from_list
from typing import List, Optional

def add_version_feedback(document_id: str, version_id: str, feedback_data: dict) -> Optional[FeedbackItemVersion]:
    document = get_document(document_id)
    if document:
        feedback = FeedbackItemVersion(content=feedback_data["content"], ref_id=version_id)
        feedback.save()
        feedback_list = FeedbackList.objects(doc_id=document_id).first()
        if not feedback_list:
            feedback_list = FeedbackList(doc_id=document)
            feedback_list.feedback_item_list = []
            feedback_list.save()

        add_feedback_to_list(feedback_list.id, feedback)
        feedback_list.save()
        return feedback
    return None

def remove_version_feedback(document_id: str, feedback_id: str) -> Optional[FeedbackItemVersion]:
    feedback_list = FeedbackList.objects(doc_id=document_id).first()
    feedback = None
    if feedback_list:
        for i in feedback_list.feedback_item_list:
            if str(i.id) == str(feedback_id):
                feedback = i
                break
        if feedback:
            remove_feedback_from_list(feedback_list.id, feedback_list.feedback_item_list.index(feedback))
            feedback_list.save()
            return feedback
    return None

def get_version_feedbacks(document_id: str, version_id: str) -> Optional[List[FeedbackItemVersion]]:
    feedback_list = FeedbackList.objects(doc_id=document_id).first()
    if feedback_list:
        return [feedback for feedback in feedback_list.feedback_item_list if feedback.ref_id == version_id]
    return None

def get_version_feedback(document_id: str, feedback_id: str) -> Optional[FeedbackItemVersion]:
    feedback_list = FeedbackList.objects(doc_id=document_id).first()
    if feedback_list:
        for feedback in feedback_list.feedback_item_list:
            if str(feedback.id) == str(feedback_id):
                return feedback
    return None
