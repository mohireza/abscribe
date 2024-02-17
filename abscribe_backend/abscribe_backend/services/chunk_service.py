"""This model is responsible for CRUD of chunks in the database, as they are defined in models.chunk.py"""
# services/chunk_service.py
from abscribe_backend.models.document import Document
from abscribe_backend.models.chunk import Chunk
from abscribe_backend.models.version import Version
from abscribe_backend.services.document_service import get_document
from typing import List, Optional
from datetime import datetime
from datetime import timezone


def add_chunk(document_id: str, chunk_data: dict) -> Optional[Chunk]:
    document = get_document(document_id)
    if document:
        version_data_list = chunk_data.get("versions", [])
        versions = [
            Version(
                frontend_id=version_data["frontend_id"], text=version_data["text"],
                timestamp=datetime.now(timezone.utc))
            for version_data in version_data_list
        ]
        chunk = Chunk(frontend_id=chunk_data["frontend_id"], versions=versions, timestamp=datetime.now(timezone.utc))
        document.chunks.append(chunk)
        document.save()
        return chunk
    return None


# Remove a chunk from a document by index


def remove_chunk(document_id: str, chunk_index: int) -> Optional[Chunk]:
    document = get_document(document_id)
    if document and 0 <= chunk_index < len(document.chunks):
        removed_chunk = document.chunks.pop(chunk_index)
        document.save()
        return removed_chunk
    return None


# Get all chunks of a document by ID


def get_chunks(document_id: str) -> Optional[List[Chunk]]:
    document = get_document(document_id)
    if document:
        return document.chunks
    return None


# Get a specific chunk from a document by index


def get_chunk(document_id: str, chunk_index: int) -> Optional[Chunk]:
    document = get_document(document_id)
    if document and 0 <= chunk_index < len(document.chunks):
        return document.chunks[chunk_index]
    return None
