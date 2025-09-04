#!/usr/bin/env node

/**
 * Backup Notification System
 * 
 * Sends notifications about backup status via multiple channels:
 * - Slack webhook
 * - Email via SendGrid
 * - GitHub commit status
 * 
 * Usage:
 *   node scripts/backup-notifications.js --status=success --backup-id=2024-01-15/143022
 */

const https = require('https');
const { execSync } = require('child_process');

class BackupNotifications {
  constructor() {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.sendgridApiKey = process.env.SENDGRID_API_KEY;
    this.githubToken = process.env.GITHUB_TOKEN;
    this.notificationEmail = process.env.BACKUP_NOTIFICATION_EMAIL || 'devops@miamente.com';
  }

  /**
   * Send Slack notification
   */
  async sendSlackNotification(status, report) {
    if (!this.slackWebhookUrl) {
      console.log('⚠️ Slack webhook URL not configured, skipping Slack notification');
      return;
    }

    try {
      const color = status === 'success' ? 'good' : 'danger';
      const emoji = status === 'success' ? '✅' : '❌';
      
      const message = {
        text: `${emoji} Firestore Backup ${status === 'success' ? 'Completed' : 'Failed'}`,
        attachments: [
          {
            color: color,
            fields: [
              {
                title: 'Backup ID',
                value: report.summary.backupId,
                short: true
              },
              {
                title: 'Project',
                value: report.summary.projectId,
                short: true
              },
              {
                title: 'Duration',
                value: `${report.summary.duration}ms`,
                short: true
              },
              {
                title: 'Collections',
                value: report.summary.totalCollections.toString(),
                short: true
              },
              {
                title: 'Documents',
                value: report.summary.totalDocuments.toString(),
                short: true
              },
              {
                title: 'Size',
                value: report.summary.totalSize,
                short: true
              }
            ],
            footer: 'Miamente Backup System',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      if (report.errors.length > 0) {
        message.attachments[0].fields.push({
          title: 'Errors',
          value: report.errors.map(e => `• ${e.collection || e.operation}: ${e.error}`).join('\n'),
          short: false
        });
      }

      await this.sendHttpRequest(this.slackWebhookUrl, 'POST', message);
      console.log('✅ Slack notification sent');
      
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error.message);
    }
  }

  /**
   * Send email notification via SendGrid
   */
  async sendEmailNotification(status, report) {
    if (!this.sendgridApiKey) {
      console.log('⚠️ SendGrid API key not configured, skipping email notification');
      return;
    }

    try {
      const subject = `Firestore Backup ${status === 'success' ? 'Completed Successfully' : 'Failed'}`;
      const html = this.generateEmailHtml(status, report);
      
      const emailData = {
        personalizations: [
          {
            to: [{ email: this.notificationEmail }],
            subject: subject
          }
        ],
        from: { email: 'noreply@miamente.com', name: 'Miamente Backup System' },
        content: [
          {
            type: 'text/html',
            value: html
          }
        ]
      };

      const options = {
        hostname: 'api.sendgrid.com',
        port: 443,
        path: '/v3/mail/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sendgridApiKey}`,
          'Content-Type': 'application/json'
        }
      };

      await this.sendHttpRequest(`https://api.sendgrid.com/v3/mail/send`, 'POST', emailData, options);
      console.log('✅ Email notification sent');
      
    } catch (error) {
      console.error('❌ Failed to send email notification:', error.message);
    }
  }

  /**
   * Update GitHub commit status
   */
  async updateGitHubStatus(status, report) {
    if (!this.githubToken || !process.env.GITHUB_SHA || !process.env.GITHUB_REPOSITORY) {
      console.log('⚠️ GitHub context not available, skipping GitHub status update');
      return;
    }

    try {
      const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
      const sha = process.env.GITHUB_SHA;
      
      const state = status === 'success' ? 'success' : 'failure';
      const description = status === 'success' 
        ? `Backup completed: ${report.summary.totalDocuments} documents`
        : `Backup failed: ${report.summary.errorCount} errors`;

      const statusData = {
        state: state,
        target_url: `https://console.firebase.google.com/project/${report.summary.projectId}/storage`,
        description: description,
        context: 'backup/firestore'
      };

      const url = `https://api.github.com/repos/${owner}/${repo}/statuses/${sha}`;
      const options = {
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'User-Agent': 'Miamente-Backup-System',
          'Content-Type': 'application/json'
        }
      };

      await this.sendHttpRequest(url, 'POST', statusData, options);
      console.log('✅ GitHub status updated');
      
    } catch (error) {
      console.error('❌ Failed to update GitHub status:', error.message);
    }
  }

  /**
   * Generate HTML email content
   */
  generateEmailHtml(status, report) {
    const color = status === 'success' ? '#28a745' : '#dc3545';
    const emoji = status === 'success' ? '✅' : '❌';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Firestore Backup ${status === 'success' ? 'Success' : 'Failure'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${color}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .summary { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${emoji} Firestore Backup ${status === 'success' ? 'Completed Successfully' : 'Failed'}</h1>
        </div>
        
        <div class="content">
            <div class="summary">
                <h2>Backup Summary</h2>
                <table>
                    <tr><td><strong>Backup ID:</strong></td><td>${report.summary.backupId}</td></tr>
                    <tr><td><strong>Project:</strong></td><td>${report.summary.projectId}</td></tr>
                    <tr><td><strong>Start Time:</strong></td><td>${new Date(report.summary.startTime).toLocaleString()}</td></tr>
                    <tr><td><strong>End Time:</strong></td><td>${new Date(report.summary.endTime).toLocaleString()}</td></tr>
                    <tr><td><strong>Duration:</strong></td><td>${report.summary.duration}ms</td></tr>
                    <tr><td><strong>Collections:</strong></td><td>${report.summary.totalCollections}</td></tr>
                    <tr><td><strong>Documents:</strong></td><td>${report.summary.totalDocuments}</td></tr>
                    <tr><td><strong>Size:</strong></td><td>${report.summary.totalSize}</td></tr>
                    <tr><td><strong>Errors:</strong></td><td>${report.summary.errorCount}</td></tr>
                </table>
            </div>

            <h3>Collection Details</h3>
            <table>
                <thead>
                    <tr>
                        <th>Collection</th>
                        <th>Documents</th>
                        <th>Size</th>
                        <th>Duration</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(report.collections).map(([name, data]) => `
                        <tr>
                            <td>${name}</td>
                            <td>${data.documentCount}</td>
                            <td>${this.formatBytes(data.fileSize)}</td>
                            <td>${data.duration}ms</td>
                            <td>${data.success ? '✅ Success' : '❌ Failed'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            ${report.errors.length > 0 ? `
                <h3>Errors</h3>
                ${report.errors.map(error => `
                    <div class="error">
                        <strong>${error.collection || error.operation}:</strong> ${error.error}
                    </div>
                `).join('')}
            ` : ''}

            <div class="${status === 'success' ? 'success' : 'error'}">
                <strong>Backup Status:</strong> ${status === 'success' ? 'All collections backed up successfully!' : 'Backup completed with errors. Please check the details above.'}
            </div>

            <p>
                <strong>Storage Location:</strong> gs://${report.summary.projectId}.appspot.com/backups/${report.summary.backupId}/
            </p>
            
            <p>
                <em>This is an automated message from the Miamente Backup System.</em>
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Send HTTP request
   */
  async sendHttpRequest(url, method, data, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const postData = JSON.stringify(data);
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...options.headers
        }
      };

      const req = https.request(requestOptions, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(responseData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(postData);
      }
      
      req.end();
    });
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
   * Send all notifications
   */
  async sendNotifications(status, report) {
    console.log(`📢 Sending ${status} notifications...`);
    
    const promises = [
      this.sendSlackNotification(status, report),
      this.sendEmailNotification(status, report),
      this.updateGitHubStatus(status, report)
    ];

    await Promise.allSettled(promises);
    console.log('✅ All notifications sent');
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith('--status=')) {
      options.status = arg.split('=')[1];
    } else if (arg.startsWith('--backup-id=')) {
      options.backupId = arg.split('=')[1];
    } else if (arg.startsWith('--report-file=')) {
      options.reportFile = arg.split('=')[1];
    } else if (arg === '--help') {
      console.log(`
Backup Notification System

Usage:
  node scripts/backup-notifications.js [options]

Options:
  --status=STATUS        Backup status (success|failure)
  --backup-id=ID         Backup ID for reference
  --report-file=PATH     Path to backup report JSON file
  --help                 Show this help message

Environment Variables:
  SLACK_WEBHOOK_URL      Slack webhook URL for notifications
  SENDGRID_API_KEY       SendGrid API key for email notifications
  GITHUB_TOKEN           GitHub token for status updates
  BACKUP_NOTIFICATION_EMAIL  Email address for notifications

Examples:
  node scripts/backup-notifications.js --status=success --backup-id=2024-01-15/143022
  node scripts/backup-notifications.js --status=failure --report-file=backup-report.json
      `);
      process.exit(0);
    }
  }

  if (!options.status) {
    console.error('❌ Status is required (--status=success|failure)');
    process.exit(1);
  }

  try {
    const notifications = new BackupNotifications();
    
    let report;
    if (options.reportFile) {
      const fs = require('fs').promises;
      const reportData = await fs.readFile(options.reportFile, 'utf8');
      report = JSON.parse(reportData);
    } else {
      // Create minimal report from command line options
      report = {
        summary: {
          backupId: options.backupId || 'unknown',
          projectId: process.env.FIREBASE_PROJECT_ID || 'unknown',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 0,
          success: options.status === 'success',
          totalCollections: 0,
          totalDocuments: 0,
          totalSize: '0 Bytes',
          errorCount: options.status === 'success' ? 0 : 1
        },
        collections: {},
        errors: options.status === 'success' ? [] : [{ operation: 'backup_process', error: 'Backup failed' }]
      };
    }

    await notifications.sendNotifications(options.status, report);
    console.log('✅ Notifications completed');
    
  } catch (error) {
    console.error('💥 Notification system failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { BackupNotifications };
