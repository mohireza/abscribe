# ABScribe

A research prototype for exploring and organizing multiple writing variations with Large Language Models.
Read more about the project in this CHI2024 [preprint](https://arxiv.org/abs/2310.00117).

## Directory Structure

The project is organized into the following directories:

- `abscribe_backend`: The backend application provides a set of tools for managing documents, chunks, and versions. The application allows users to create and manipulate documents that contain rich text content. The backend is built using Python and MongoDB, and it leverages the MongoEngine ODM for database operations. [Read more](abscribe_backend/README.md)

- `abscribe_frontend`: The frontend application provides a clutter-free editing interface powered by Large Language Models. The application allows users to craft, organize, and explore diverse phrasings effortlessly. The frontend is built using React and Tailwind CSS, and it leverages the OpenAI GPT-3 API for language model operations.

## Contributing

Please see the [contributing](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
