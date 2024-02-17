import unittest
from mongoengine import connect, disconnect
from abscribe_backend.models.document import Document
from abscribe_backend.services.document_service import (
    create_document,
    get_documents,
    get_document,
    update_document,
    delete_document,
)


class TestDocumentService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        disconnect()
        connect("test_documents_db")

    @classmethod
    def tearDownClass(cls):
        disconnect()

    def setUp(self):
        Document.drop_collection()

    def test_document_crud(self):
        # Test create_document
        doc = create_document(content="Sample Document")
        self.assertIsNotNone(doc)
        self.assertEqual(doc.content, "Sample Document")

        # Test get_documents
        docs = get_documents()
        self.assertEqual(len(docs), 1)

        # Test get_document
        fetched_doc = get_document(doc.id)
        self.assertIsNotNone(fetched_doc)
        self.assertEqual(fetched_doc.content, "Sample Document")

        # Test update_document
        updated_doc = update_document(doc.id, "Updated Document", "NuName")
        self.assertIsNotNone(updated_doc)
        self.assertEqual(updated_doc.content, "Updated Document")
        self.assertEqual(updated_doc.name, "NuName")

        # Test delete_document
        result = delete_document(doc.id)
        self.assertTrue(result)
        docs = get_documents()
        self.assertEqual(len(docs), 0)

    def test_document_rich_text_content(self):
        # Define rich text content (HTML formatted string)
        rich_text_content = (
            "<h1>Heading</h1><p>This is a <strong>paragraph</strong> with <em>rich"
            " text</em> content.</p>"
        )

        # Test create_document with rich text content
        doc = create_document(content=rich_text_content)
        self.assertIsNotNone(doc)
        self.assertEqual(doc.content, rich_text_content)

        # Test get_document
        fetched_doc = get_document(doc.id)
        self.assertIsNotNone(fetched_doc)
        self.assertEqual(fetched_doc.content, rich_text_content)

        # Test update_document with new rich text content
        new_rich_text_content = (
            "<h2>Updated Heading</h2><p>Updated <strong>content</strong> with <em>rich"
            " text</em>.</p>"
        )
        updated_doc = update_document(doc.id, new_rich_text_content, "NuName")
        self.assertIsNotNone(updated_doc)
        self.assertEqual(updated_doc.content, new_rich_text_content)
        self.assertEqual(updated_doc.name, "NuName")


if __name__ == "__main__":
    unittest.main()
