import datetime
from .version import Version
from abscribe_backend.database.mongo_connection import db
DUMMY_DATE = datetime.datetime(1, 1, 1)


class Chunk(db.EmbeddedDocument):
    frontend_id = db.StringField(required=True)
    versions = db.ListField(db.EmbeddedDocumentField(Version))
    timestamp = db.DateTimeField(required=True, default=DUMMY_DATE)

    # FIXME: Maybe I should standardize the timestamp field since it's reused everywhere.
    def to_dict(self):
        return {
            "frontend_id": self.frontend_id,
            "versions": [version.to_dict() for version in self.versions],
            "timestamp": self.timestamp.isoformat() if self.timestamp else "Unknown"
        }
