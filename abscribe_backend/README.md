# ABScribe Backend

## Overview

ABScribe is a backend application that provides a set of tools for managing documents, chunks, and versions. The application allows users to create and manipulate documents that contain rich text content. Each document is divided into chunks, and each chunk can have multiple versions of text. The backend is built using Python and MongoDB, and it leverages the MongoEngine ODM for database operations.

## Features

- Document CRUD operations: Create, read, update, and delete documents.
- Chunk CRUD operations: Add and remove chunks within a document.
- Version CRUD operations: Add, update, and remove versions within a chunk.

## Models

### Document

- `content`: The content of the document (StringField).
- `chunks`: A list of chunks within the document (ListField of EmbeddedDocumentField).

### Chunk

- `versions`: A list of versions within the chunk (ListField of EmbeddedDocumentField).

### Version

- `text`: The text content of the version (StringField).

## Services

### Document Service

- `create_document(content)`: Create a new document with the given content.
- `get_documents()`: Get a list of all documents.
- `get_document(document_id)`: Get a specific document by ID.
- `update_document(document_id, updated_content)`: Update the content of a document by ID.
- `delete_document(document_id)`: Delete a document by ID.

### Chunk Service

- `add_chunk(document_id, chunk_data)`: Add a new chunk to a document by ID.
- `remove_chunk(document_id, chunk_index)`: Remove a chunk from a document by index.

### Version Service

- `add_version(document_id, chunk_index, version_text)`: Add a new version to a chunk in a document by index.
- `update_version(document_id, chunk_index, version_index, updated_text)`: Update a version in a chunk of a document by index.
- `remove_version(document_id, chunk_index, version_index)`: Remove a version from a chunk of a document by index.

## Tests

The application includes a comprehensive test suite that covers CRUD operations for documents, chunks, and versions. The tests also include scenarios with rich text content.

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to contribute to the project.

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- The ABScribe team for their hard work and dedication to the project.
