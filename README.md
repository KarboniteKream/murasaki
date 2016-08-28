# murasaki
The next-generation RSS reader.

## Requirements
- Node.js
- Knex.js (optional)

## Installation
```bash
npm install -g knex  # Optional.
npm install
```

## Configuration
```bash
knex init
# Edit configuration in knexfile.js.
knex migrate:latest
```
You can also use the local Knex.js in `node_modules/.bin/knex` instead.

## Running
```bash
node main.js
```
