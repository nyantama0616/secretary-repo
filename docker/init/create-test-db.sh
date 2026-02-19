#!/bin/bash
set -e

psql -U "$POSTGRES_USER" -c "CREATE DATABASE ${POSTGRES_DB}_test;"
