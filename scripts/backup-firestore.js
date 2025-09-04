#!/usr/bin/env node

/**
 * Firestore Backup Script
 * 
 * This script exports all Firestore collections to JSON files and uploads them to Firebase Storage.
 * Collections backed up:
 * - users
 * - professionals
 * - availability
 * - appointments
 * - payments
 * - reviews
 * - event_log
 * - feature_flags
 * 
 * Usage:
 *   node scripts/backup-firestore.js [--project=PROJECT_ID] [--dry-run]
 * 
 * Environment Variables:
 *   - GOOGLE_APPLICATION_CREDENTIALS: Path to service account key file
 *   - FIREBASE_PROJECT_ID: Firebase project ID (defaults to miamente-prod)
 *   - BACKUP_BUCKET: Storage bucket for backups (defaults to project-id.appspot.com)
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  collections: [
    'users',
    'professionals', 
    'availability',
    'appointments',
    'payments',
    'reviews',
    'event_log',
    'feature_flags'
  ],
  batchSize: 500, // Firestore batch read limit
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
};

class FirestoreBackup {
  constructor(options = {}) {
    this.projectId = options.projectId || process.env.FIREBASE_PROJECT_ID || 'miamente-prod';
    this.bucketName = options.bucketName || process.env.BACKUP_BUCKET || `${this.projectId}.appspot.com`;
    this.dryRun = options.dryRun || false;
    this.app = null;
    this.db = null;
    this.storage = null;
    this.backupId = this.generateBackupId();
    this.backupPath = null;
    this.results = {
      startTime: new Date(),
      endTime: null,
      collections: {},
      totalDocuments: 0,
      totalSize: 0,
      errors: [],
      success: false
    };
  }

  /**
   * Generate unique backup ID with timestamp
   */
  generateBackupId() {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
    return `${date}/${time}`;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  async initializeFirebase() {
    try {
      console.log(`🔧 Initializing Firebase Admin SDK for project: ${this.projectId}`);
      
      // Check for service account credentials
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!serviceAccountPath) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is required');
      }

      // Read service account key
      const serviceAccount = JSON.parse(await fs.readFile(serviceAccountPath, 'utf8'));
      
      // Initialize Firebase Admin
      this.app = initializeApp({
        credential: cert(serviceAccount),
        projectId: this.projectId,
        storageBucket: this.bucketName
      });

      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);
      
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
      throw error;
    }
  }

  /**
   * Create local backup directory
   */
  async createBackupDirectory() {
    try {
      this.backupPath = path.join(process.cwd(), 'backups', this.backupId);
      await fs.mkdir(this.backupPath, { recursive: true });
      console.log(`📁 Created backup directory: ${this.backupPath}`);
    } catch (error) {
      console.error('❌ Failed to create backup directory:', error.message);
      throw error;
    }
  }

  /**
   * Export a single collection to JSON
   */
  async exportCollection(collectionName) {
    console.log(`📦 Exporting collection: ${collectionName}`);
    
    const startTime = Date.now();
    let documents = [];
    let totalSize = 0;
    let lastDoc = null;
    let batchCount = 0;

    try {
      while (true) {
        let query = this.db.collection(collectionName).limit(CONFIG.batchSize);
        
        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();
        
        if (snapshot.empty) {
          break;
        }

        batchCount++;
        const batchDocs = [];
        
        snapshot.forEach(doc => {
          const docData = {
            id: doc.id,
            data: doc.data(),
            createTime: doc.createTime?.toDate()?.toISOString(),
            updateTime: doc.updateTime?.toDate()?.toISOString()
          };
          
          batchDocs.push(docData);
          lastDoc = doc;
        });

        documents.push(...batchDocs);
        totalSize += JSON.stringify(batchDocs).length;
        
        console.log(`  📄 Batch ${batchCount}: ${batchDocs.length} documents`);
      }

      // Write to JSON file
      const filePath = path.join(this.backupPath, `${collectionName}.json`);
      const jsonContent = JSON.stringify(documents, null, 2);
      await fs.writeFile(filePath, jsonContent, 'utf8');

      const duration = Date.now() - startTime;
      const fileSize = Buffer.byteLength(jsonContent, 'utf8');
      
      this.results.collections[collectionName] = {
        documentCount: documents.length,
        fileSize: fileSize,
        duration: duration,
        success: true
      };

      this.results.totalDocuments += documents.length;
      this.results.totalSize += fileSize;

      console.log(`✅ ${collectionName}: ${documents.length} documents, ${this.formatBytes(fileSize)}, ${duration}ms`);
      
    } catch (error) {
      console.error(`❌ Failed to export collection ${collectionName}:`, error.message);
      
      this.results.collections[collectionName] = {
        documentCount: 0,
        fileSize: 0,
        duration: 0,
        success: false,
        error: error.message
      };

      this.results.errors.push({
        collection: collectionName,
        error: error.message
      });
    }
  }

  /**
   * Export all collections
   */
  async exportAllCollections() {
    console.log(`🚀 Starting export of ${CONFIG.collections.length} collections...`);
    
    for (const collectionName of CONFIG.collections) {
      await this.exportCollection(collectionName);
    }
  }

  /**
   * Create backup metadata file
   */
  async createMetadataFile() {
    const metadata = {
      backupId: this.backupId,
      projectId: this.projectId,
      timestamp: this.results.startTime.toISOString(),
      version: '1.0.0',
      collections: CONFIG.collections,
      results: this.results,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    const metadataPath = path.join(this.backupPath, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
    
    console.log('📋 Created backup metadata file');
    return metadata;
  }

  /**
   * Upload backup to Firebase Storage
   */
  async uploadToStorage() {
    if (this.dryRun) {
      console.log('🔍 Dry run: Skipping storage upload');
      return;
    }

    console.log(`☁️ Uploading backup to Firebase Storage: gs://${this.bucketName}/backups/${this.backupId}/`);
    
    try {
      const bucket = this.storage.bucket();
      const remotePath = `backups/${this.backupId}/`;
      
      // Upload all files in the backup directory
      const files = await fs.readdir(this.backupPath);
      
      for (const file of files) {
        const localPath = path.join(this.backupPath, file);
        const remoteFilePath = `${remotePath}${file}`;
        
        console.log(`  📤 Uploading: ${file}`);
        await bucket.upload(localPath, {
          destination: remoteFilePath,
          metadata: {
            metadata: {
              backupId: this.backupId,
              projectId: this.projectId,
              timestamp: this.results.startTime.toISOString()
            }
          }
        });
      }

      console.log('✅ Backup uploaded to Firebase Storage successfully');
      
    } catch (error) {
      console.error('❌ Failed to upload backup to storage:', error.message);
      this.results.errors.push({
        operation: 'storage_upload',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate backup integrity
   */
  async validateBackup() {
    console.log('🔍 Validating backup integrity...');
    
    const validationResults = {
      filesExist: true,
      filesReadable: true,
      jsonValid: true,
      errors: []
    };

    try {
      for (const collectionName of CONFIG.collections) {
        const filePath = path.join(this.backupPath, `${collectionName}.json`);
        
        // Check if file exists
        try {
          await fs.access(filePath);
        } catch (error) {
          validationResults.filesExist = false;
          validationResults.errors.push(`File not found: ${collectionName}.json`);
          continue;
        }

        // Check if file is readable and valid JSON
        try {
          const content = await fs.readFile(filePath, 'utf8');
          JSON.parse(content);
        } catch (error) {
          validationResults.filesReadable = false;
          validationResults.jsonValid = false;
          validationResults.errors.push(`Invalid JSON in ${collectionName}.json: ${error.message}`);
        }
      }

      if (validationResults.errors.length === 0) {
        console.log('✅ Backup validation passed');
      } else {
        console.log('⚠️ Backup validation failed:');
        validationResults.errors.forEach(error => console.log(`  - ${error}`));
      }

      return validationResults;
      
    } catch (error) {
      console.error('❌ Backup validation error:', error.message);
      return {
        filesExist: false,
        filesReadable: false,
        jsonValid: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Clean up local backup files
   */
  async cleanup() {
    try {
      if (this.backupPath && !this.dryRun) {
        console.log('🧹 Cleaning up local backup files...');
        await fs.rm(this.backupPath, { recursive: true, force: true });
        console.log('✅ Local backup files cleaned up');
      }
    } catch (error) {
      console.error('⚠️ Failed to cleanup local files:', error.message);
    }
  }

  /**
   * Generate backup report
   */
  generateReport() {
    this.results.endTime = new Date();
    this.results.duration = this.results.endTime - this.results.startTime;
    this.results.success = this.results.errors.length === 0;

    const report = {
      summary: {
        backupId: this.backupId,
        projectId: this.projectId,
        startTime: this.results.startTime.toISOString(),
        endTime: this.results.endTime.toISOString(),
        duration: this.results.duration,
        success: this.results.success,
        totalCollections: CONFIG.collections.length,
        totalDocuments: this.results.totalDocuments,
        totalSize: this.formatBytes(this.results.totalSize),
        errorCount: this.results.errors.length
      },
      collections: this.results.collections,
      errors: this.results.errors
    };

    return report;
  }

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Main backup execution
   */
  async run() {
    try {
      console.log('🚀 Starting Firestore backup process...');
      console.log(`📊 Project: ${this.projectId}`);
      console.log(`☁️ Storage: gs://${this.bucketName}`);
      console.log(`🆔 Backup ID: ${this.backupId}`);
      console.log(`🔍 Dry Run: ${this.dryRun}`);
      console.log('');

      await this.initializeFirebase();
      await this.createBackupDirectory();
      await this.exportAllCollections();
      await this.createMetadataFile();
      
      const validationResults = await this.validateBackup();
      await this.uploadToStorage();
      
      const report = this.generateReport();
      
      console.log('');
      console.log('📊 BACKUP SUMMARY');
      console.log('================');
      console.log(`🆔 Backup ID: ${report.summary.backupId}`);
      console.log(`⏱️ Duration: ${report.summary.duration}ms`);
      console.log(`✅ Success: ${report.summary.success}`);
      console.log(`📦 Collections: ${report.summary.totalCollections}`);
      console.log(`📄 Documents: ${report.summary.totalDocuments}`);
      console.log(`💾 Size: ${report.summary.totalSize}`);
      console.log(`❌ Errors: ${report.summary.errorCount}`);
      
      if (report.errors.length > 0) {
        console.log('');
        console.log('❌ ERRORS:');
        report.errors.forEach(error => {
          console.log(`  - ${error.collection || error.operation}: ${error.error}`);
        });
      }

      await this.cleanup();
      
      return report;
      
    } catch (error) {
      console.error('💥 Backup process failed:', error.message);
      this.results.errors.push({
        operation: 'backup_process',
        error: error.message
      });
      
      const report = this.generateReport();
      await this.cleanup();
      
      throw error;
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith('--project=')) {
      options.projectId = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help') {
      console.log(`
Firestore Backup Script

Usage:
  node scripts/backup-firestore.js [options]

Options:
  --project=PROJECT_ID    Firebase project ID (default: miamente-prod)
  --dry-run              Run without uploading to storage
  --help                 Show this help message

Environment Variables:
  GOOGLE_APPLICATION_CREDENTIALS  Path to service account key file
  FIREBASE_PROJECT_ID            Firebase project ID
  BACKUP_BUCKET                  Storage bucket for backups

Examples:
  node scripts/backup-firestore.js
  node scripts/backup-firestore.js --project=miamente-staging
  node scripts/backup-firestore.js --dry-run
      `);
      process.exit(0);
    }
  }

  try {
    const backup = new FirestoreBackup(options);
    const report = await backup.run();
    
    // Exit with appropriate code
    process.exit(report.summary.success ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { FirestoreBackup };
