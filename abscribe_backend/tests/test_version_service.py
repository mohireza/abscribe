import unittest
from mongoengine import connect, disconnect
from abscribe_backend.models.document import Document
from abscribe_backend.models.chunk import Chunk
from abscribe_backend.models.version import Version
from abscribe_backend.services.version_service import (
    add_version,
    update_version,
    remove_version,
)
from abscribe_backend.services.document_service import create_document, get_document
from abscribe_backend.services.chunk_service import add_chunk


class TestVersionService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        disconnect()
        connect("test_versions_db")

    @classmethod
    def tearDownClass(cls):
        disconnect()

    def setUp(self):
        Document.drop_collection()

    def test_version_crud(self):
        # Create a document
        doc = create_document("Document Content")

        # Prepare chunk data
        version = Version(frontend_id="version_1", text="Initial Version")
        chunk_data = {
            "frontend_id": "1",
            "versions": [version],
        }

        # Add a chunk to the document with the prepared chunk data
        chunk = add_chunk(document_id=doc.id, chunk_data=chunk_data)

        # Test add_version
        version_data = {"frontend_id": "version_2", "text": "Version 1"}
        version = add_version(
            document_id=doc.id, chunk_index=0, version_data=version_data
        )
        self.assertIsNotNone(version)
        self.assertEqual(version.text, "Version 1")

        # Test update_version
        updated_version = update_version(
            document_id=doc.id,
            chunk_index=0,
            version_index=0,
            updated_text="Updated Version",
        )
        self.assertIsNotNone(updated_version)
        self.assertEqual(updated_version.text, "Updated Version")

        # Test remove_version
        removed_version = remove_version(
            document_id=doc.id, chunk_index=0, version_index=0
        )
        self.assertIsNotNone(removed_version)
        self.assertEqual(removed_version.text, "Updated Version")

        # Verify that the version was removed and one version remains
        fetched_doc = get_document(doc.id)
        self.assertEqual(len(fetched_doc.chunks[0].versions), 1)

    def test_version_crud_richtext(self):
        # Create a document
        doc = create_document("Document Content")

        # Prepare chunk data with rich text content
        version = Version(
            frontend_id="version_1", text="<strong>Initial Version</strong>"
        )
        chunk_data = {
            "frontend_id": "1",
            "versions": [version],
        }

        # Add a chunk to the document with the prepared chunk data
        chunk = add_chunk(document_id=doc.id, chunk_data=chunk_data)

        # Test add_version with rich text content
        version_data = {"frontend_id": "version_2", "text": "<em>Version 1</em>"}
        version = add_version(
            document_id=doc.id, chunk_index=0, version_data=version_data
        )
        self.assertIsNotNone(version)
        self.assertEqual(version.text, "<em>Version 1</em>")

        # Test update_version with rich text content
        updated_version = update_version(
            document_id=doc.id,
            chunk_index=0,
            version_index=0,
            updated_text="<u>Updated Version</u>",
        )
        self.assertIsNotNone(updated_version)
        self.assertEqual(updated_version.text, "<u>Updated Version</u>")

        # Test remove_version
        removed_version = remove_version(
            document_id=doc.id, chunk_index=0, version_index=0
        )
        self.assertIsNotNone(removed_version)
        self.assertEqual(removed_version.text, "<u>Updated Version</u>")

        # Verify that the version was removed and one version remains
        fetched_doc = get_document(doc.id)
        self.assertEqual(len(fetched_doc.chunks[0].versions), 1)

    

if __name__ == "__main__":
    unittest.main()
