# Frontend Deployment Guide

This document describes the AWS infrastructure and deployment process for the Miamente frontend (Next.js React application).

## Architecture Overview

The frontend is deployed using AWS CloudFormation with the following architecture:

- **ECS Fargate**: Containerized Next.js application
- **Application Load Balancer (ALB)**: Routes traffic to ECS service
- **Auto Scaling**: Scales based on CPU utilization
- **CloudWatch Logs**: Centralized logging
- **Security Groups**: Network security configuration

## Infrastructure Components

### ECS Cluster

- Managed container orchestration using Fargate
- Environment-specific clusters (staging/production)
- Container insights enabled for monitoring

### Task Definition

- **Staging**: 512 CPU, 1024 MB memory
- **Production**: 1024 CPU, 2048 MB memory
- Health check endpoint: `/health`
- Logging to CloudWatch

### Load Balancer

- Internet-facing ALB
- Health checks on port 3000
- HTTP listener (port 80)

### Auto Scaling

- **Staging**: 1-3 instances
- **Production**: 2-10 instances
- CPU target: 70%
- Cooldown periods: 300 seconds

## Environment Variables

The application uses the following environment variables:

- `NODE_ENV`: Environment (development/production)
- `NEXT_PUBLIC_API_URL`: Backend API URL (from backend deployment)
- `PROJECT_NAME`: Project name
- `VERSION`: Application version

## Required GitHub Secrets

The following secrets must be configured in GitHub:

### AWS Credentials

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

### Infrastructure

- `LAB_ROLE_ARN`: IAM role for ECS tasks
- `VPC_ID`: VPC ID for deployment
- `SUBNET_IDS`: Comma-separated list of public subnet IDs

### Backend URLs

- `BACKEND_API_URL_STAGING`: Backend ALB URL for staging
- `BACKEND_API_URL_PROD`: Backend ALB URL for production

### Docker Hub

- `DOCKERHUB_USERNAME`: Docker Hub username
- `DOCKERHUB_FRONTEND_REPOSITORY`: Frontend repository name

### Project Configuration

- `PROJECT_NAME`: Project name
- `VERSION`: Application version

## Deployment Process

### Staging Deployment

Triggered on push to `develop` branch:

1. Build and test frontend
2. Build and push Docker image
3. Deploy CloudFormation stack to staging
4. Run SonarCloud analysis

### Production Deployment

Triggered on push to `main` branch:

1. Build and test frontend
2. Build and push Docker image
3. Deploy CloudFormation stack to production

## Health Check

The application includes a health check endpoint at `/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "frontend"
}
```

## Monitoring

- **CloudWatch Logs**: Application logs
- **ECS Service**: Container health and metrics
- **ALB**: Load balancer metrics and access logs
- **Auto Scaling**: Scaling events and metrics

## Scaling Configuration

### Staging Environment

- Min capacity: 1 task
- Max capacity: 3 tasks
- Target CPU: 70%

### Production Environment

- Min capacity: 2 tasks
- Max capacity: 10 tasks
- Target CPU: 70%

## Security

- Security groups restrict traffic to necessary ports
- ALB security group allows HTTP/HTTPS from internet
- ECS security group allows traffic only from ALB
- IAM roles follow least privilege principle

## Troubleshooting

### Common Issues

1. **Health Check Failures**
   - Verify `/health` endpoint is accessible
   - Check application logs in CloudWatch
   - Ensure container is listening on port 3000

2. **Deployment Failures**
   - Check CloudFormation events in AWS Console
   - Verify all required secrets are configured
   - Ensure VPC and subnets are correctly configured

3. **Scaling Issues**
   - Monitor CPU utilization in CloudWatch
   - Check Auto Scaling group metrics
   - Verify target group health

### Useful Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster miamente-frontend-staging --services miamente-frontend-staging-service

# View CloudWatch logs
aws logs describe-log-streams --log-group-name /ecs/miamente-frontend-staging

# Check ALB target health
aws elbv2 describe-target-health --target-group-arn <target-group-arn>
```

## Cost Optimization

- Use Fargate Spot for non-production workloads
- Implement CloudWatch alarms for cost monitoring
- Regular review of resource utilization
- Use appropriate instance sizes based on load
