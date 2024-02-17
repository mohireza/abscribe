from abscribe_backend.models.document import Document
from abscribe_backend.models.chunk import Chunk
from abscribe_backend.models.version import Version
from abscribe_backend.services.document_service import get_document
from typing import Optional
from datetime import datetime, timezone


# Version CRUD operations (add_version, update_version, remove_version) go here


# Add a new version to a chunk in a document by index
def add_version(document_id: str, chunk_index: int, version_data: dict) -> Optional[Version]:
    document = get_document(document_id)
    if document and 0 <= chunk_index < len(document.chunks):
        version = Version(
            frontend_id=version_data["frontend_id"], text=version_data["text"], timestamp=datetime.now(timezone.utc)
        )
        document.chunks[chunk_index].versions.append(version)
        document.save()
        return version
    return None


# Update a version in a chunk of a document by index
def update_version(document_id: str, chunk_index: int, version_index: int, updated_text: str) -> Optional[Version]:
    document = get_document(document_id)
    if (
            document
            and 0 <= chunk_index < len(document.chunks)
            and 0 <= version_index < len(document.chunks[chunk_index].versions)
    ):
        version = document.chunks[chunk_index].versions[version_index]
        version.text = updated_text
        document.save()
        return version
    return None


# Remove a version from a chunk of a document by index
def remove_version(document_id: str, chunk_index: int, version_index: int) -> Optional[Version]:
    document = get_document(document_id)
    if (
            document
            and 0 <= chunk_index < len(document.chunks)
            and 0 <= version_index < len(document.chunks[chunk_index].versions)
    ):
        removed_version = document.chunks[chunk_index].versions.pop(version_index)
        document.save()
        return removed_version
    return None
