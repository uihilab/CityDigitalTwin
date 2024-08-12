#!/bin/bash

# Navigate to the project root directory
#cd "$(dirname "$0")"

# Pull the latest changes from git
git pull

# Navigate to the frontend directory
cd frontend/

# Install npm dependencies
npm install

# Build the project
npm run build

# Create a backup directory with the current datetime
backup_dir="/www/hydroinformatics.uiowa.edu/lab/dt/backup_$(date +"%Y%m%d_%H%M%S")"
mkdir -p "$backup_dir"

# Move existing files to the backup directory
mv /www/hydroinformatics.uiowa.edu/lab/dt/* "$backup_dir"

# Copy the new build files to the target directory
cp -r build/* /www/hydroinformatics.uiowa.edu/lab/dt/

echo "Build and deployment completed successfully."
