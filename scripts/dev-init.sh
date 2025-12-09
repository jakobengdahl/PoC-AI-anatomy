#!/usr/bin/env bash
set -e

echo "Installerar beroenden i rot..."
npm install

echo "Installerar frontend beroenden..."
# With workspaces, root install should cover it, but explicit check doesn't hurt if separate logic is added later.
cd frontend && npm install && cd ..

echo "Installerar backend beroenden..."
cd backend && npm install && cd ..

if [ ! -f backend/.env.example ]; then
  cat <<EOF > backend/.env.example
OPENAI_API_KEY=your_key_here
EOF
fi

echo "Init klart. Kopiera backend/.env.example till backend/.env och fyll i OPENAI_API_KEY."
