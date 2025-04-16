#!/bin/bash

# Define source and destination directories
SOURCE_DIR="./KeyboardMappings"
DEST_DIR="./MappingHelper/KeyboardMappingMirror"

# Copy all contents from source to destination
cp -r "$SOURCE_DIR/"* "$DEST_DIR/"

echo "All files synced from $SOURCE_DIR to $DEST_DIR."