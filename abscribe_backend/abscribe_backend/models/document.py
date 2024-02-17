from datetime import datetime

from abscribe_backend.database.mongo_connection import db
from .chunk import Chunk
DUMMY_DATE = datetime(1, 1, 1)


class Document(db.Document):
    content = db.StringField(required=True)
    name = db.StringField(required=False)
    chunks = db.ListField(db.EmbeddedDocumentField(Chunk))
    timestamp = db.DateTimeField(required=True, default=DUMMY_DATE)

    def to_dict(self):
        return {
            "_id": str(self.id),
            "name": str(self.name),
            "content": self.content,
            "chunks": [chunk.to_dict() for chunk in self.chunks],
            "timestamp": self.timestamp.isoformat() if self.timestamp is not None else "Unknown?"
        }
