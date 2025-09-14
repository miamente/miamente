# Uploads Directory

This directory contains user-uploaded files and is excluded from version control.

## Directory Structure

```
uploads/
├── certifications/          # Professional certification documents
│   └── {user_id}/          # User-specific subdirectories
│       └── {file_id}.pdf   # Uploaded certification files
├── profile_pictures/       # User profile pictures
│   └── {user_id}/
│       └── {file_id}.jpg   # Profile picture files
└── documents/              # Other user documents
    └── {user_id}/
        └── {file_id}.*     # Various document types
```

## File Naming Convention

- Files are stored in user-specific subdirectories using the user's UUID
- Each uploaded file gets a unique UUID as filename
- Original file extensions are preserved

## Security Notes

- This directory is excluded from git version control
- Files are validated on upload for type and size
- Access is controlled through authentication middleware
