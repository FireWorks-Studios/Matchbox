#!/bin/bash

# Define source and destination directories
SOURCE_DIR="Software/KeyboardMappings"
DEST_DIR="Software/MappingHelper/KeyboardMappingMirror"

# Copy all contents from source to destination
cp -r "$SOURCE_DIR/"* "$DEST_DIR/"

echo "All files synced from $SOURCE_DIR to $DEST_DIR."