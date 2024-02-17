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

from abscribe_backend.services.document_service import (
    create_document,
    get_documents,
    get_document,
    update_document,
    delete_document,
)

from abscribe_backend.services.feedback_list_service import (
    create_feedback_list,
    add_feedback_to_list,
    remove_feedback_from_list,
    get_feedback_list_by_document,
    get_feedback_list,
    delete_feedback_list,
)

from abscribe_backend.services.feedback_item_document_service import (
    add_doc_feedback,
    remove_doc_feedback,
    get_doc_feedbacks,
    get_doc_feedback,

)

from abscribe_backend.services.feedback_item_version_service import (
    add_version_feedback,
    remove_version_feedback,
    get_version_feedbacks,
    get_version_feedback,
)

from abscribe_backend.services.feedback_item_chunk_service import (
    add_chunk_feedback,
    remove_chunk_feedback,
    get_chunk_feedbacks,
    get_chunk_feedback,
)


from abscribe_backend.models.feedback_item_chunk import FeedbackItemChunk

from abscribe_backend.services.chunk_service import add_chunk, remove_chunk


class TestFeedbackListService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        disconnect()
        connect("test_feedback_db")

    @classmethod
    def tearDownClass(cls):
        disconnect()

    def setUp(self):
        Document.drop_collection()

    def create_sample_document(self) -> Document:
        # Create a document
        doc = create_document("Sample Document Content")

        # Prepare chunk data with a version
        version = Version(frontend_id="version_1", text="Initial Version")
        chunk_data = {
            "frontend_id": "1",
            "versions": [version],
        }

        # Add a chunk to the document
        add_chunk(document_id=doc.id, chunk_data=chunk_data)
        doc.reload()
        return doc

    def test_feedback_list_crud(self):
        doc = self.create_sample_document()

        # Test create_feedback_list
        feedback_item_chunk = FeedbackItemChunk(
            content="Feedback for chunk", ref_id=doc.chunks[0].frontend_id)
        feedback_item_chunk.save()

        feedback_list = create_feedback_list(
            document_id=doc.id, feedback_items=[feedback_item_chunk])
        self.assertIsNotNone(feedback_list)
        self.assertEqual(len(feedback_list.feedback_item_list), 1)

        # Test add_feedback_to_list
        new_feedback_item_chunk = FeedbackItemChunk(
            content="Another Feedback for chunk", ref_id=doc.chunks[0].frontend_id)
        new_feedback_item_chunk.save()
        updated_feedback_list = add_feedback_to_list(
            feedback_list_id=feedback_list.id, feedback_item=new_feedback_item_chunk)
        self.assertIsNotNone(updated_feedback_list)
        self.assertEqual(len(updated_feedback_list.feedback_item_list), 2)

        # Test remove_feedback_from_list
        removed_feedback = remove_feedback_from_list(
            feedback_list_id=feedback_list.id, feedback_item_index=0)
        self.assertIsNotNone(removed_feedback)

        # Test get_feedback_list_by_document
        fetched_feedback_list_by_doc = get_feedback_list_by_document(
            document_id=doc.id)
        self.assertIsNotNone(fetched_feedback_list_by_doc)

        # Test get_feedback_list
        fetched_feedback_list = get_feedback_list(
            feedback_list_id=feedback_list.id)
        self.assertIsNotNone(fetched_feedback_list)

        # Test delete_feedback_list
        is_deleted = delete_feedback_list(feedback_list_id=feedback_list.id)
        self.assertTrue(is_deleted)

        # Check if feedback list is actually deleted
        deleted_feedback_list = get_feedback_list(
            feedback_list_id=feedback_list.id)
        self.assertIsNone(deleted_feedback_list)


class TestFeedbackItemDocService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        disconnect()
        connect("test_feedback_db")

    @classmethod
    def tearDownClass(cls):
        disconnect()

    def setUp(self):
        Document.drop_collection()

    def create_sample_document(self) -> Document:
        # Create a document
        doc = create_document("Sample Document Content")

        # Prepare chunk data with a version
        version = Version(frontend_id="version_1", text="Initial Version")
        chunk_data = {
            "frontend_id": "1",
            "versions": [version],
        }

        # Add a chunk to the document
        add_chunk(document_id=doc.id, chunk_data=chunk_data)
        return doc

    def test_feedback_item_doc_crud(self):
        doc = self.create_sample_document()
        create_feedback_list(document_id=doc.id, feedback_items=[])

        # Test add_doc_feedback
        feedback_data = {"content": "Feedback for document"}
        feedback_item_doc = add_doc_feedback(
            document_id=doc.id, feedback_data=feedback_data)
        self.assertIsNotNone(feedback_item_doc)

        # Test get_doc_feedbacks
        feedbacks_for_document = get_doc_feedbacks(document_id=doc.id)
        self.assertEqual(len(feedbacks_for_document), 1)

        # Test get_doc_feedback
        fetched_feedback_item_doc = get_doc_feedback(
            document_id=doc.id, feedback_id=feedback_item_doc.id)
        self.assertIsNotNone(fetched_feedback_item_doc)

        # Test remove_doc_feedback
        removed_feedback_item_doc = remove_doc_feedback(
            document_id=doc.id, feedback_id=feedback_item_doc.id)
        self.assertIsNotNone(removed_feedback_item_doc)


class TestFeedbackItemVersionService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        disconnect()
        connect("test_feedback_db")

    @classmethod
    def tearDownClass(cls):
        disconnect()

    def setUp(self):
        Document.drop_collection()

    def create_sample_document(self) -> Document:
        # Create a document
        doc = create_document("Sample Document Content")

        # Prepare chunk data with a version
        version = Version(frontend_id="version_1", text="Initial Version")
        chunk_data = {
            "frontend_id": "1",
            "versions": [version],
        }

        # Add a chunk to the document
        add_chunk(document_id=doc.id, chunk_data=chunk_data)
        doc.reload()
        return doc

    def test_feedback_item_version_crud(self):
        doc = self.create_sample_document()
        version = doc.chunks[0].versions[0]
        create_feedback_list(document_id=doc.id, feedback_items=[])

        # Test add_version_feedback
        feedback_data = {"content": "Feedback for version"}
        feedback_item_version = add_version_feedback(
            document_id=doc.id, version_id=version.frontend_id, feedback_data=feedback_data)
        self.assertIsNotNone(feedback_item_version)

        # Test get_version_feedbacks
        feedbacks_for_version = get_version_feedbacks(document_id=doc.id, version_id=version.frontend_id)
        self.assertEqual(len(feedbacks_for_version), 1)

        # Test get_version_feedback
        fetched_feedback_item_version = get_version_feedback(
            document_id=doc.id, feedback_id=feedback_item_version.id)
        self.assertIsNotNone(fetched_feedback_item_version)

        # Test remove_version_feedback
        removed_feedback_item_version = remove_version_feedback(
            document_id=doc.id, feedback_id=feedback_item_version.id)
        self.assertIsNotNone(removed_feedback_item_version)

class TestFeedbackItemChunkService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        disconnect()
        connect("test_feedback_db")

    @classmethod
    def tearDownClass(cls):
        disconnect()

    def setUp(self):
        Document.drop_collection()

    def create_sample_document(self) -> Document:
        # Create a document
        doc = create_document("Sample Document Content")

        # Prepare chunk data with a version
        version = Version(frontend_id="version_1", text="Initial Version")
        chunk_data = {
            "frontend_id": "1",
            "versions": [version],
        }

        # Add a chunk to the document
        add_chunk(document_id=doc.id, chunk_data=chunk_data)
        doc.reload()
        return doc

    def test_feedback_item_chunk_crud(self):
        doc = self.create_sample_document()
        chunk = doc.chunks[0]
        create_feedback_list(document_id=doc.id, feedback_items=[])

        # Test add_chunk_feedback
        feedback_data = {"content": "Feedback for chunk"}
        feedback_item_chunk = add_chunk_feedback(
            document_id=doc.id, chunk_id=chunk.frontend_id, feedback_data=feedback_data)
        self.assertIsNotNone(feedback_item_chunk)

        # Test get_chunk_feedbacks
        feedbacks_for_chunk = get_chunk_feedbacks(document_id=doc.id, chunk_id=chunk.frontend_id)
        self.assertEqual(len(feedbacks_for_chunk), 1)

        # Test get_chunk_feedback
        fetched_feedback_item_chunk = get_chunk_feedback(
            document_id=doc.id, feedback_id=feedback_item_chunk.id)
        self.assertIsNotNone(fetched_feedback_item_chunk)

        # Test remove_chunk_feedback
        removed_feedback_item_chunk = remove_chunk_feedback(
            document_id=doc.id, feedback_id=feedback_item_chunk.id)
        self.assertIsNotNone(removed_feedback_item_chunk)
