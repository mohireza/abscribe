from datetime import datetime

from abscribe_backend.database.mongo_connection import db
DUMMY_DATE = datetime(1, 1, 1)


# Abstract class for Feedback items
class FeedbackItem(db.Document):
    meta = {"abstract": True}
    content = db.StringField()
    timestamp = db.DateTimeField(required=True, default=DUMMY_DATE)
    ref_id = db.StringField(required=False)

    def to_dict(self):
        pass

# TODO: ADD STATUS (PENDING, RESOLVED, etc.)