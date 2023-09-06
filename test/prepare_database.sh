#!/bin/bash
export NODE_ENV=test
export DATA_SOURCE_FILE="test/e2e/utils/dataSource.ts"

npm run typeorm schema:drop -- -d "$DATA_SOURCE_FILE"
npm run typeorm schema:sync -- -d "$DATA_SOURCE_FILE"
npm run typeorm migration:run -- -d "$DATA_SOURCE_FILE"
npm run install-game

export FILE=test_db.db

if [ -f "$FILE" ]; then
    echo "$FILE exists."
else
    echo "$FILE does not exist."
    exit 1
fi