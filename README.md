# AI PoC Assistant

This repository contains a Proof of Concept (PoC) for an AI assistant, as described in `roadmap.md`.

## Structure

The project is organized as a monorepo with the following workspaces:

*   `frontend`: React-based frontend application.
*   `backend`: Node.js backend application.
*   `mcp-tools`: Directory for Model Context Protocol (MCP) tools.

## Getting Started

1.  Clone the repository.
2.  Run `npm install` in the root directory to install dependencies for all workspaces.
3.  Follow the instructions in `roadmap.md` for further development steps.

## GitHub Codespaces

This repository is configured for GitHub Codespaces. To start working:

1.  Click the "Code" button on GitHub.
2.  Select the "Codespaces" tab.
3.  Click "Create codespace on main".

The environment will be automatically set up with Node.js, and dependencies will be installed.

## Development Initialization

To set up the local development environment (or if you need to reset):

1.  Run `./scripts/dev-init.sh`
2.  Copy `backend/.env.example` to `backend/.env`
3.  Add your `OPENAI_API_KEY` to `backend/.env`
