# Contributing to ABScribe

We're excited that you're interested in contributing to the ABScribe project! Your contributions are valuable and will help improve the project for the entire community. This document provides guidelines and instructions for contributing to the project.

## Set up

### Downloading the Repository

To get started, make sure you have forked the repository. If you don't have experience with GitHub, you can follow the instructions in the [GitHub documentation](https://docs.github.com/en/get-started/quickstart/fork-a-repo).
Next, clone your fork to your local machine to begin setting up the development environment.

```bash
git clone https://github.com/yourusername/abscribe.git
```

### Dependencies

This project includes a backend and a frontend. Both sets of dependencies are managed separately.

To install the backend dependencies, navigate to the `abscribe_backend`

```bash
cd abscribe_backend
```

Then, install the dependencies and set up the development environment using [Poetry](https://python-poetry.org/).

```bash
poetry install
```

To activate the virtual environment, run the following command.

```bash
poetry shell
```

To install the frontend dependencies, navigate to the `abscribe_frontend` directory.

```bash
cd ../frontend
```

Then, install the dependencies using npm.

```bash
npm install
```

### Local Development Server

You will need to run both the backend and frontend development servers to work on the project.

To run the backend development server, navigate to the `abscribe_backend` directory and run the following command.

```bash
poetry run flask run
```

To run the frontend development server, navigate to the `abscribe_frontend` directory and run the following command.

```bash
npm start
```

## API Keys

You'll need a few API keys to run the project locally. Locate the `.env.example` file in the `abscribe_frontend` directory and rename it to `.env`. To get the TinyMCE API key, visit the [TinyMCE website](https://www.tiny.cloud/) and sign up for an API key. Add the key to the `.env` file. 


## Submitting a Pull Request

1. Create a new branch for your changes: `git checkout -b my-feature-branch`
2. Commit your changes: `git commit -m "Add my feature"`
3. Push your changes to your fork: `git push origin my-feature-branch`
4. Open a pull request on the original repository.
5. Provide a clear and concise description of your changes in the pull request.
6. Address any feedback or requested changes from the maintainers.

This is only a basic outline of the process. For more detailed instructions, please refer to the [GitHub documentation](https://docs.github.com/en/pull-requests).

## Making Changes

- Write clean, readable, and maintainable code.
- Follow the coding style and conventions used in the project.
- Add or update tests for any new or modified functionality.
- Ensure that all tests pass before submitting a pull request.
- Update documentation if necessary.

## Reporting Issues

If you encounter any bugs or issues, please open an issue on the GitHub repository. When reporting an issue, provide as much detail as possible, including steps to reproduce the issue and any relevant error messages.

## Community

We welcome contributions from developers of all skill levels. If you have any questions or need help getting started, feel free to reach out to the maintainers or join our community chat.

## Thank You

Thank you for considering contributing to ABScribe! Your contributions help make this project better for everyone.
