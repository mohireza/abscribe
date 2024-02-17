"""This file is responsible for CRUD of Document objects in the database, as they are defined in models.document.py."""
# services/document_service.py
from abscribe_backend.models.document import Document
from typing import List, Optional
from datetime import tzinfo
from datetime import datetime
from datetime import timezone


def create_document(content: str, name: str = "Untitled document") -> Document:
    """Create a new document."""
    document = Document(content=content, name=name, timestamp=datetime.now(timezone.utc))
    document.save()
    return document


def get_documents() -> List[Document]:
    from abscribe_backend.app import app # Just for logging.
    """Get a list of all documents."""
    documents = Document.objects().all()
    return [document for document in documents]


def get_document(document_id: str) -> Optional[Document]:
    """Get a specific document by ID"""
    document = Document.objects(id=document_id).first()
    return document if document else None


def update_document(
        document_id: str, updated_content: str, updated_name: str
) -> Optional[Document]:
    """Update the content of a document by ID"""
    print(f"Updating document with ID: {document_id}")

    if not updated_content and not updated_name:
        return None

    if updated_name:
        document = Document.objects(id=document_id).modify(
            new=True, set__content=updated_content, set__name=updated_name
        )
    else:
        document = Document.objects(id=document_id).modify(
            new=True, set__content=updated_content
        )

    return document if document else None


def delete_document(document_id: str) -> bool:
    """Delete a document by ID"""
    result = Document.objects(id=document_id).delete()
    return result > 0
