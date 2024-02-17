import unittest
from mongoengine import connect, disconnect
from abscribe_backend.models.document import Document
from abscribe_backend.models.chunk import Chunk
from abscribe_backend.models.version import Version
from abscribe_backend.services.chunk_service import add_chunk, remove_chunk
from abscribe_backend.services.document_service import create_document, get_document
from datetime import datetime, timezone


class TestChunkService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        disconnect()
        connect("test_chunks_db")

    @classmethod
    def tearDownClass(cls):
        disconnect()

    def setUp(self):
        Document.drop_collection()

    def test_chunk_crud(self):
        # Create a document
        doc = create_document("Document Content")

        # Test add_chunk
        chunk_data = {
            "frontend_id": "1",
            "versions": [{"text": "Version 1", "frontend_id": "1"}],
        }
        chunk = add_chunk(document_id=doc.id, chunk_data=chunk_data)
        self.assertIsNotNone(chunk)
        self.assertEqual(chunk.versions[0].text, "Version 1")
        self.assertEqual(chunk.versions[0].frontend_id, "1")

        # Test get_document (to retrieve chunks)
        fetched_doc = get_document(doc.id)
        self.assertIsNotNone(fetched_doc)
        self.assertEqual(len(fetched_doc.chunks), 1)

        # Test remove_chunk
        removed_chunk = remove_chunk(document_id=doc.id, chunk_index=0)
        self.assertIsNotNone(removed_chunk)
        self.assertEqual(removed_chunk.versions[0].text, "Version 1")
        self.assertEqual(removed_chunk.versions[0].frontend_id, "1")

        # Verify that the chunk was removed
        fetched_doc = get_document(doc.id)
        self.assertEqual(len(fetched_doc.chunks), 0)

    def test_chunk_crud_richtext(self):
        # Create a document
        doc = create_document("Document Content")

        # Define rich text content for versions
        rich_text_version_1 = "<p><strong>Version 1</strong></p>"
        rich_text_version_2 = "<p><em>Version 2</em></p>"

        # Test add_chunk with rich text versions
        chunk_data = {
            "frontend_id": "1",
            "versions": [
                {"text": rich_text_version_1, "frontend_id": "1"},
                {"text": rich_text_version_2, "frontend_id": "2"},
            ],
        }
        chunk = add_chunk(document_id=doc.id, chunk_data=chunk_data)
        self.assertIsNotNone(chunk)
        self.assertEqual(chunk.versions[0].text, rich_text_version_1)
        self.assertEqual(chunk.versions[0].frontend_id, "1")
        self.assertEqual(chunk.versions[1].text, rich_text_version_2)
        self.assertEqual(chunk.versions[1].frontend_id, "2")

        # Test get_document (to retrieve chunks)
        fetched_doc = get_document(doc.id)
        self.assertIsNotNone(fetched_doc)
        self.assertEqual(len(fetched_doc.chunks), 1)

        # Test remove_chunk
        removed_chunk = remove_chunk(document_id=doc.id, chunk_index=0)
        self.assertIsNotNone(removed_chunk)
        self.assertEqual(removed_chunk.versions[0].text, rich_text_version_1)
        self.assertEqual(removed_chunk.versions[0].frontend_id, "1")
        self.assertEqual(removed_chunk.versions[1].text, rich_text_version_2)
        self.assertEqual(removed_chunk.versions[1].frontend_id, "2")

        # Verify that the chunk was removed
        fetched_doc = get_document(doc.id)
        self.assertEqual(len(fetched_doc.chunks), 0)


if __name__ == "__main__":
    unittest.main()
