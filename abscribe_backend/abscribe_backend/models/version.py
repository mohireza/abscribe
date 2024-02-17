from flask_mongoengine import MongoEngine
from abscribe_backend.database.mongo_connection import db
from datetime import datetime
DUMMY_DATE = datetime(1, 1, 1)

class Version(db.EmbeddedDocument):
    frontend_id = db.StringField(required=True)
    text = db.StringField(required=True)
    timestamp = db.DateTimeField(required=True, default=DUMMY_DATE)

    def to_dict(self):
        return {"frontend_id": self.frontend_id, "text": self.text, "timestamp": self.timestamp.isoformat() if self.timestamp else "Unknown"}
