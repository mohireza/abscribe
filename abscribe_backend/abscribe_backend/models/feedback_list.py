from datetime import datetime

from abscribe_backend.database.mongo_connection import db
from abscribe_backend.models.document import Document
from abscribe_backend.models.feedback_item import FeedbackItem
DUMMY_DATE = datetime(1, 1, 1)


class FeedbackList(db.Document):
    doc_id = db.ReferenceField(Document)
    feedback_item_list =  db.ListField(db.GenericReferenceField()) # this must be generic because we are using an abstract class
    timestamp = db.DateTimeField(required=True, default=DUMMY_DATE)

    def to_dict(self):
        return {
            "_id": str(self.id),
            "doc_id": str(self.doc_id),
            "feedback_item_list": [feedback_item.to_dict() for feedback_item in self.feedback_item_list],
            "timestamp": self.timestamp.isoformat() if self.timestamp is not None else "Unknown?"
        }
