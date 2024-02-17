import unittest
import json
from abscribe_backend.app import app
from abscribe_backend.models.document import Document, db
from abscribe_backend.services.chunk_service import add_chunk
from abscribe_backend.services.version_service import add_version



class TestAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config["MONGODB_SETTINGS"] = {
            "db": "test_documents_db",
            "host": "localhost",
            "port": 27017,
        }
        cls.db = db

    @classmethod
    def tearDownClass(cls):
        with app.app_context():
            cls.db.connection.drop_database("test_documents_db")

    def setUp(self):
        Document.objects.delete()
        self.app = app.test_client()  # Initialize the test client

    def test_create_document_route(self):
        # Test create_document_route
        document = {"content": "Test document content"}
        response = self.app.post("/documents", json=document)
        self.assertEqual(response.status_code, 201)
        post_data = json.loads(response.data)
        self.assertIn("_id", post_data)

        # Test get_documents_route
        response = self.app.get("/documents")
        self.assertEqual(response.status_code, 200)
        documents_data = json.loads(response.data)
        self.assertIsInstance(documents_data, list)
        self.assertEqual(len(documents_data), 1)

        # Test get_document_route
        response = self.app.get(f"/documents/{documents_data[0]['_id']}")
        self.assertEqual(response.status_code, 200)
        document_data = json.loads(response.data)
        self.assertIsInstance(document_data, dict)
        self.assertIn("_id", document_data)
        self.assertIn("content", document_data)
        self.assertEqual(document_data["content"], "Test document content")

        # Test update_document_route
        updated_document = {"content": "Updated document content"}
        print(documents_data)
        response = self.app.put(
            f"/documents/{document_data['_id']['$oid']}", json=updated_document
        )
        self.assertEqual(response.status_code, 200)
        updated_data = json.loads(response.data)
        self.assertIn("_id", updated_data)
        self.assertIn("content", updated_data)
        self.assertEqual(updated_data["content"], "Updated document content")

        # Test delete_document_route
        response = self.app.delete(f"/documents/{updated_data['_id']}")
        self.assertEqual(response.status_code, 200)
        delete_data = json.loads(response.data)
        self.assertIn("result", delete_data)
        self.assertEqual(delete_data["result"], "Document deleted")

        # Test get_documents_route after delete
        response = self.app.get("/documents")
        self.assertEqual(response.status_code, 200)
        documents_data = json.loads(response.data)
        self.assertIsInstance(documents_data, list)
        self.assertEqual(len(documents_data), 0)
    
    def test_document_feedback_routes(self):
        # Create a new document for testing
        document = {"content": "Test document content"}
        response = self.app.post("/documents", json=document)
        self.assertEqual(response.status_code, 201)
        document_data = json.loads(response.data)

        # Test add_document_feedback_route
        feedback = {"content": "Feedback text"}
        response = self.app.post(f"/documents/{document_data['_id']['$oid']}/feedback", json=feedback)
        self.assertEqual(response.status_code, 201)
        feedback_data = json.loads(response.data)
        self.assertIn("content", feedback_data)

        # Test get_document_feedbacks_route
        response = self.app.get(f"/documents/{document_data['_id']['$oid']}/feedback")
        self.assertEqual(response.status_code, 200)
        feedbacks_data = json.loads(response.data)
        print("feedbacks_data", feedbacks_data)
        self.assertIsInstance(feedbacks_data, list)
        self.assertEqual(len(feedbacks_data), 1)

        # Test get_document_feedback_route
        response = self.app.get(f"/documents/{document_data['_id']['$oid']}/feedback/{feedbacks_data[0]['_id']}")
        self.assertEqual(response.status_code, 200)
        single_feedback_data = json.loads(response.data)
        self.assertIsInstance(single_feedback_data, dict)
        self.assertIn("content", single_feedback_data)

        # Test remove_document_feedback_route
        response = self.app.delete(f"/documents/{document_data['_id']['$oid']}/feedback/{feedbacks_data[0]['_id']}")
        self.assertEqual(response.status_code, 200)
        delete_feedback_data = json.loads(response.data)
        self.assertIn("result", delete_feedback_data)
        self.assertEqual(delete_feedback_data["result"], "Feedback removed")

    def test_chunk_feedback_routes(self):
        # Create a new document for testing
        document = {"content": "Test document content"}
        doc_response = self.app.post("/documents", json=document)
        self.assertEqual(doc_response.status_code, 201)
        doc_data = json.loads(doc_response.data)
        document_id = doc_data['_id']['$oid']

        # Add chunk data
        chunk_data = {
            "frontend_id": "1",
            "versions": [{"text": "Version 1", "frontend_id": "1"}],
        }
        chunk = add_chunk(document_id=document_id, chunk_data=chunk_data)
        chunk_id = chunk.frontend_id

        # Test add_chunk_feedback_route
        feedback = {"content": "Chunk feedback text"}
        response = self.app.post(f"/documents/{document_id}/chunks/{chunk_id}/feedback", json=feedback)
        self.assertEqual(response.status_code, 201)
        feedback_data = json.loads(response.data)
        self.assertIn("content", feedback_data)

        # Test get_chunk_feedbacks_route
        response = self.app.get(f"/documents/{document_id}/chunks/{chunk_id}/feedback")
        self.assertEqual(response.status_code, 200)
        feedbacks_data = json.loads(response.data)
        self.assertIsInstance(feedbacks_data, list)


    
    def test_version_feedback_routes(self):
        # Create a new document and add a chunk for testing
        document = {"content": "Test document content"}
        doc_response = self.app.post("/documents", json=document)
        self.assertEqual(doc_response.status_code, 201)
        doc_data = json.loads(doc_response.data)
        document_id = doc_data['_id']['$oid']

        chunk_data = {
            "frontend_id": "1",
            "versions": [],
        }

        add_chunk(document_id=document_id, chunk_data=chunk_data)

        # Add version data
        version_data = {"frontend_id": "version_2", "text": "Version 1"}
        version = add_version(document_id=document_id, chunk_index=0, version_data=version_data)
        version_id = version.frontend_id

        # Test add_version_feedback_route
        feedback = {"content": "Version feedback text"}
        response = self.app.post(f"/documents/{document_id}/versions/{version_id}/feedback", json=feedback)
        self.assertEqual(response.status_code, 201)
        feedback_data = json.loads(response.data)
        self.assertIn("content", feedback_data)

        # Test get_version_feedbacks_route
        response = self.app.get(f"/documents/{document_id}/versions/{version_id}/feedback")
        self.assertEqual(response.status_code, 200)
        feedbacks_data = json.loads(response.data)
        self.assertIsInstance(feedbacks_data, list)







if __name__ == "__main__":
    unittest.main()
