from datetime import datetime
DUMMY_DATE = datetime(1, 1, 1)
from abscribe_backend.database.mongo_connection import db


class Recipe(db.Document):
    """A MongoEngine Model class for recipes in our database. """
    frontend_id = db.StringField(required=True, unique=True)  # Should these be primary keys? Others aren't so
    # probably not.
    name = db.StringField(required=True)
    prompt = db.StringField(required=True)
    creation_timestamp = db.DateTimeField(required=True, default=DUMMY_DATE)
    edit_timestamp = db.DateTimeField(required=True, default=DUMMY_DATE)
    home_document_id = db.StringField(required=True)

    def to_dict(self):
        return {
            "_id": str(self.id),
            "frontend_id": self.frontend_id,
            "name": self.name,
            "prompt": self.prompt,
            "creation_timestamp": self.creation_timestamp.isoformat(),
            "edit_timestamp": self.edit_timestamp.isoformat(),
            "home_document_id": self.home_document_id
        }
