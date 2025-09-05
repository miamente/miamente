#!/usr/bin/env node

/**
 * Backup Validation Script
 *
 * Validates the integrity and completeness of Firestore backups.
 * Checks:
 * - File existence and readability
 * - JSON validity
 * - Document count consistency
 * - Data integrity
 * - Storage accessibility
 *
 * Usage:
 *   node scripts/validate-backup.js --backup-id=2024-01-15/143022 [--project=PROJECT_ID]
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const fs = require("fs").promises;
const path = require("path");

const CONFIG = {
  collections: [
    "users",
    "professionals",
    "availability",
    "appointments",
    "payments",
    "reviews",
    "event_log",
    "feature_flags",
  ],
  requiredFields: {
    users: ["email", "fullName", "createdAt"],
    professionals: ["email", "fullName", "specialty", "rateCents"],
    availability: ["professionalId", "date", "time", "duration"],
    appointments: ["userId", "professionalId", "date", "time", "status"],
    payments: ["appointmentId", "amount", "currency", "status"],
    reviews: ["appointmentId", "userId", "professionalId", "rating", "comment"],
    event_log: ["eventType", "timestamp", "userId"],
    feature_flags: ["name", "enabled", "description"],
  },
};

class BackupValidator {
  constructor(options = {}) {
    this.projectId = options.projectId || process.env.FIREBASE_PROJECT_ID || "miamente-prod";
    this.bucketName =
      options.bucketName || process.env.BACKUP_BUCKET || `${this.projectId}.appspot.com`;
    this.backupId = options.backupId;
    this.app = null;
    this.db = null;
    this.storage = null;
    this.validationResults = {
      backupId: this.backupId,
      timestamp: new Date().toISOString(),
      overall: {
        success: false,
        score: 0,
        totalChecks: 0,
        passedChecks: 0,
      },
      collections: {},
      errors: [],
      warnings: [],
    };
  }

  /**
   * Initialize Firebase Admin SDK
   */
  async initializeFirebase() {
    try {
      console.log(`🔧 Initializing Firebase Admin SDK for project: ${this.projectId}`);

      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!serviceAccountPath) {
        throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable is required");
      }

      const serviceAccount = JSON.parse(await fs.readFile(serviceAccountPath, "utf8"));

      this.app = initializeApp({
        credential: cert(serviceAccount),
        projectId: this.projectId,
        storageBucket: this.bucketName,
      });

      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);

      console.log("✅ Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Firebase Admin SDK:", error.message);
      throw error;
    }
  }

  /**
   * Download backup from storage
   */
  async downloadBackup() {
    try {
      console.log(
        `📥 Downloading backup from storage: gs://${this.bucketName}/backups/${this.backupId}/`,
      );

      const bucket = this.storage.bucket();
      const remotePath = `backups/${this.backupId}/`;
      const localPath = path.join(process.cwd(), "temp-backup", this.backupId);

      // Create local directory
      await fs.mkdir(localPath, { recursive: true });

      // List files in backup directory
      const [files] = await bucket.getFiles({ prefix: remotePath });

      if (files.length === 0) {
        throw new Error(`No backup found at gs://${this.bucketName}/backups/${this.backupId}/`);
      }

      // Download each file
      for (const file of files) {
        const fileName = path.basename(file.name);
        const localFilePath = path.join(localPath, fileName);

        console.log(`  📄 Downloading: ${fileName}`);
        await file.download({ destination: localFilePath });
      }

      console.log(`✅ Backup downloaded to: ${localPath}`);
      return localPath;
    } catch (error) {
      console.error("❌ Failed to download backup:", error.message);
      throw error;
    }
  }

  /**
   * Validate a single collection backup
   */
  async validateCollection(collectionName, backupPath) {
    console.log(`🔍 Validating collection: ${collectionName}`);

    const results = {
      collection: collectionName,
      checks: {
        fileExists: false,
        fileReadable: false,
        jsonValid: false,
        hasDocuments: false,
        documentCount: 0,
        requiredFields: false,
        dataIntegrity: false,
      },
      errors: [],
      warnings: [],
    };

    try {
      const filePath = path.join(backupPath, `${collectionName}.json`);

      // Check file existence
      try {
        await fs.access(filePath);
        results.checks.fileExists = true;
        this.validationResults.overall.totalChecks++;
        this.validationResults.overall.passedChecks++;
      } catch (error) {
        results.errors.push(`File not found: ${collectionName}.json`);
        this.validationResults.overall.totalChecks++;
        return results;
      }

      // Check file readability and JSON validity
      try {
        const content = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(content);

        results.checks.fileReadable = true;
        results.checks.jsonValid = true;
        results.checks.documentCount = data.length;
        results.checks.hasDocuments = data.length > 0;

        this.validationResults.overall.totalChecks += 2;
        this.validationResults.overall.passedChecks += 2;

        // Validate required fields
        if (CONFIG.requiredFields[collectionName] && data.length > 0) {
          const requiredFields = CONFIG.requiredFields[collectionName];
          const sampleDoc = data[0];

          const missingFields = requiredFields.filter(
            (field) => !sampleDoc.data || !(field in sampleDoc.data),
          );

          if (missingFields.length === 0) {
            results.checks.requiredFields = true;
            this.validationResults.overall.totalChecks++;
            this.validationResults.overall.passedChecks++;
          } else {
            results.warnings.push(
              `Missing required fields in sample document: ${missingFields.join(", ")}`,
            );
            this.validationResults.overall.totalChecks++;
          }
        }

        // Basic data integrity checks
        let integrityIssues = 0;

        for (const doc of data) {
          // Check document structure
          if (!doc.id || !doc.data) {
            integrityIssues++;
            continue;
          }

          // Check for null/undefined values in critical fields
          if (collectionName === "users" && (!doc.data.email || !doc.data.fullName)) {
            integrityIssues++;
          }

          if (collectionName === "appointments" && (!doc.data.userId || !doc.data.professionalId)) {
            integrityIssues++;
          }
        }

        if (integrityIssues === 0) {
          results.checks.dataIntegrity = true;
          this.validationResults.overall.totalChecks++;
          this.validationResults.overall.passedChecks++;
        } else {
          results.warnings.push(`${integrityIssues} documents have data integrity issues`);
          this.validationResults.overall.totalChecks++;
        }
      } catch (error) {
        results.errors.push(`Invalid JSON: ${error.message}`);
        this.validationResults.overall.totalChecks++;
      }
    } catch (error) {
      results.errors.push(`Validation error: ${error.message}`);
    }

    return results;
  }

  /**
   * Validate all collections
   */
  async validateAllCollections(backupPath) {
    console.log(`🔍 Validating ${CONFIG.collections.length} collections...`);

    for (const collectionName of CONFIG.collections) {
      const results = await this.validateCollection(collectionName, backupPath);
      this.validationResults.collections[collectionName] = results;

      if (results.errors.length > 0) {
        this.validationResults.errors.push(
          ...results.errors.map((error) => ({
            collection: collectionName,
            error: error,
          })),
        );
      }

      if (results.warnings.length > 0) {
        this.validationResults.warnings.push(
          ...results.warnings.map((warning) => ({
            collection: collectionName,
            warning: warning,
          })),
        );
      }
    }
  }

  /**
   * Compare with live data (optional)
   */
  async compareWithLiveData() {
    console.log("🔄 Comparing backup with live data...");

    try {
      for (const collectionName of CONFIG.collections) {
        const collectionResults = this.validationResults.collections[collectionName];
        if (!collectionResults || !collectionResults.checks.hasDocuments) {
          continue;
        }

        // Get live document count
        const liveSnapshot = await this.db.collection(collectionName).get();
        const liveCount = liveSnapshot.size;
        const backupCount = collectionResults.checks.documentCount;

        if (Math.abs(liveCount - backupCount) > 0) {
          const diff = liveCount - backupCount;
          this.validationResults.warnings.push({
            collection: collectionName,
            warning: `Document count mismatch: Live=${liveCount}, Backup=${backupCount}, Diff=${diff}`,
          });
        }
      }
    } catch (error) {
      this.validationResults.warnings.push({
        operation: "live_comparison",
        warning: `Failed to compare with live data: ${error.message}`,
      });
    }
  }

  /**
   * Calculate overall validation score
   */
  calculateScore() {
    const { totalChecks, passedChecks } = this.validationResults.overall;

    if (totalChecks === 0) {
      this.validationResults.overall.score = 0;
    } else {
      this.validationResults.overall.score = Math.round((passedChecks / totalChecks) * 100);
    }

    this.validationResults.overall.success =
      this.validationResults.overall.score >= 80 && this.validationResults.errors.length === 0;
  }

  /**
   * Generate validation report
   */
  generateReport() {
    this.calculateScore();

    const report = {
      validation: this.validationResults,
      summary: {
        backupId: this.backupId,
        projectId: this.projectId,
        timestamp: this.validationResults.timestamp,
        success: this.validationResults.overall.success,
        score: this.validationResults.overall.score,
        totalChecks: this.validationResults.overall.totalChecks,
        passedChecks: this.validationResults.overall.passedChecks,
        errorCount: this.validationResults.errors.length,
        warningCount: this.validationResults.warnings.length,
      },
    };

    return report;
  }

  /**
   * Clean up temporary files
   */
  async cleanup(backupPath) {
    try {
      if (backupPath) {
        console.log("🧹 Cleaning up temporary files...");
        await fs.rm(backupPath, { recursive: true, force: true });
        console.log("✅ Temporary files cleaned up");
      }
    } catch (error) {
      console.error("⚠️ Failed to cleanup temporary files:", error.message);
    }
  }

  /**
   * Main validation execution
   */
  async run() {
    let backupPath = null;

    try {
      console.log("🚀 Starting backup validation...");
      console.log(`📊 Project: ${this.projectId}`);
      console.log(`🆔 Backup ID: ${this.backupId}`);
      console.log("");

      await this.initializeFirebase();
      backupPath = await this.downloadBackup();
      await this.validateAllCollections(backupPath);
      await this.compareWithLiveData();

      const report = this.generateReport();

      console.log("");
      console.log("📊 VALIDATION SUMMARY");
      console.log("=====================");
      console.log(`🆔 Backup ID: ${report.summary.backupId}`);
      console.log(`✅ Success: ${report.summary.success}`);
      console.log(`📊 Score: ${report.summary.score}%`);
      console.log(`🔍 Checks: ${report.summary.passedChecks}/${report.summary.totalChecks}`);
      console.log(`❌ Errors: ${report.summary.errorCount}`);
      console.log(`⚠️ Warnings: ${report.summary.warningCount}`);

      if (this.validationResults.errors.length > 0) {
        console.log("");
        console.log("❌ ERRORS:");
        this.validationResults.errors.forEach((error) => {
          console.log(`  - ${error.collection}: ${error.error}`);
        });
      }

      if (this.validationResults.warnings.length > 0) {
        console.log("");
        console.log("⚠️ WARNINGS:");
        this.validationResults.warnings.forEach((warning) => {
          console.log(`  - ${warning.collection}: ${warning.warning}`);
        });
      }

      await this.cleanup(backupPath);

      return report;
    } catch (error) {
      console.error("💥 Validation process failed:", error.message);
      this.validationResults.errors.push({
        operation: "validation_process",
        error: error.message,
      });

      const report = this.generateReport();
      await this.cleanup(backupPath);

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
    if (arg.startsWith("--backup-id=")) {
      options.backupId = arg.split("=")[1];
    } else if (arg.startsWith("--project=")) {
      options.projectId = arg.split("=")[1];
    } else if (arg === "--help") {
      console.log(`
Backup Validation Script

Usage:
  node scripts/validate-backup.js [options]

Options:
  --backup-id=ID         Backup ID to validate (required)
  --project=PROJECT_ID   Firebase project ID (default: miamente-prod)
  --help                 Show this help message

Environment Variables:
  GOOGLE_APPLICATION_CREDENTIALS  Path to service account key file
  FIREBASE_PROJECT_ID            Firebase project ID
  BACKUP_BUCKET                  Storage bucket for backups

Examples:
  node scripts/validate-backup.js --backup-id=2024-01-15/143022
  node scripts/validate-backup.js --backup-id=2024-01-15/143022 --project=miamente-staging
      `);
      process.exit(0);
    }
  }

  if (!options.backupId) {
    console.error("❌ Backup ID is required (--backup-id=YYYY-MM-DD/HHMMSS)");
    process.exit(1);
  }

  try {
    const validator = new BackupValidator(options);
    const report = await validator.run();

    // Exit with appropriate code
    process.exit(report.summary.success ? 0 : 1);
  } catch (error) {
    console.error("💥 Fatal error:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { BackupValidator };
