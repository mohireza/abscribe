# ABScribe

A research prototype for exploring and organizing multiple writing variations with Large Language Models.
Read more about the project in this CHI2024 [paper](https://arxiv.org/abs/2310.00117). 

## Demo

[![ABScribe Presentation](https://img.youtube.com/vi/ZHnnSJDDwYs/0.jpg)](https://www.youtube.com/watch?v=ZHnnSJDDwYs)

## Paper

To credit this system, please cite our CHI'24 paper, "ABScribe: Rapid Exploration & Organization of Multiple Writing Variations in Human-AI Co-Writing Tasks using Large Language Models":
Mohi Reza, Nathan Laundry, Ilya Musabirov, Peter Dushniku, Zhi Yuan "Michael" Yu, Kashish Mittal, Tovi Grossman, Michael Liut, Anastasia Kuzminykh and Joseph Jay Williams. 2024

```bibtex
@inproceedings{reza2024abscribe,
  title={ABScribe: Rapid Exploration & Organization of Multiple Writing Variations in Human-AI Co-Writing Tasks using Large Language Models},
  author={Mohi Reza, Nathan Laundry, Ilya Musabirov, Peter Dushniku, Zhi Yuan "Michael" Yu, Kashish Mittal, Tovi Grossman, Michael Liut, Anastasia Kuzminykh, Joseph Jay Williams},
  booktitle={Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems},
  pages={1-18},
  organization={Association for Computing Machinery},
  doi={https://doi.org/10.1145/3613904.3641899},
  year={2024}
}
```

## Abstract

Exploring alternative ideas by rewriting text is integral to the writing process. State-of-the-art large language models (LLMs) can simplify writing variation generation. However, current interfaces pose challenges for simultaneous consideration of multiple variations: creating new versions without overwriting text can be difficult, and pasting them sequentially can clutter documents, increasing workload and disrupting writers' flow. To tackle this, we present ABScribe, an interface that supports rapid, yet visually structured, exploration of writing variations in human-AI co-writing tasks. With ABScribe, users can swiftly produce multiple variations using LLM prompts, which are auto-converted into reusable buttons. Variations are stored adjacently within text segments for rapid in-place comparisons using mouse-over interactions on a context toolbar. Our user study with 12 writers shows that ABScribe significantly reduces task workload (d = 1.20, p < 0.001), enhances user perceptions of the revision process (d = 2.41, p < 0.001) compared to a popular baseline workflow, and provides insights into how writers explore variations using LLMs.

## Getting Started

To get started with ABScribe, visit [ABScribe.ca](https://abscribe.ca) or setup locally following the instructions in the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## Technologies Used

* Frontend: React
* Backend: Python, Flask, MongoDB

## Directory Structure

The project is organized into the following directories:

### `/abscribe_backend`

The backend application provides a set of tools for managing documents, chunks, and versions. The application allows users to create and manipulate documents that contain rich text content. The backend is built using Python and MongoDB, and it leverages the MongoEngine ODM for database operations. 

#### `/abscribe_backend/models`

The models directory contains the following data models used in the application:

* `Document`: Document metadata and a list of chunks containing content.
* `Chunk`: Actual content within the document.
* `Version`: The different versions of the content within a chunk.
* `Feedback`: Comments and feedback on each part of the document.
* `Recipe`: A set of instructions for modifying the content within a document.

#### `/abscribe_backend/services`

The services directory contains the following services used in the application:

* `document_service.py`: Provides CRUD operations for documents.
* `chunk_service.py`: Provides CRUD operations for chunks within a document.
* `version_service.py`: Provides CRUD operations for versions within a chunk.
* `recipe_service.py`: Provides CRUD operations for recipes.
* `feedback_item_*_service.py`: Provides CRUD operations for feedback the various components of a document.

#### `/abscribe_backend/tests`

The tests directory contains the test suite for the backend application

#### `/abscribe_backend/app.py`

Contains all of the routes and API endpoints described in services for the application.

### `/abscribe_frontend`

The frontend application provides a clutter-free editing interface powered by Large Language Models.

#### `/abscribe_frontend/src/services`

Functions for interacting with the backend API.

#### `/abscribe_frontend/src/components`

Reusable components for the frontend application. These are the components that are currently used in the application:

* `PopupToolbar.jsx`: Toolbar component facilitating interaction with document. Main text editor utilities such as formatting, importing, etc.

* `Editor.jsx`: Rich text editor component for creating and editing documents.

* `VariationSidebar.jsx`: Sidebar component for storing and managing writing variations.

* `AIModifiers.jsx`: Sidebar component for managing and applying LLM adjustments/recipes.

* `DocumentContainer.jsx`: The main interface for user interaction. Combines the Editor and ABToolbar components.

## Contributing

Please see the [contributing](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
