# Setting Up a Secure Ubuntu VPS for Auto-Deployment

Based on your CI/CD workflow file, I'll outline the steps to set up a secure Ubuntu VPS for auto-deployment of your Java Spring Boot application. This guide will cover server setup, security measures, and the deployment script needed to work with your GitHub Actions workflow.

## 1. Initial Server Setup

### 1.1. Update the System

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2. Create a Deployment User

```bash
sudo adduser deployer
sudo usermod -aG sudo deployer
```

### 1.3. Set Up SSH Key Authentication

On your local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions-deployer"
```

Copy the public key to your server:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub deployer@your-server-ip
```

### 1.4. Disable Password Authentication

Edit SSH config:

```bash
sudo nano /etc/ssh/sshd_config
```

Set these values:

```
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

## 2. Install Required Software

### 2.1. Install Java 17

```bash
sudo apt install openjdk-17-jdk -y
```

### 2.2. Install Nginx as a Reverse Proxy

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2.3. Install UFW (Uncomplicated Firewall)

```bash
sudo apt install ufw -y
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

## 3. Application Setup

### 3.1. Create Application Directory

```bash
sudo mkdir -p /opt/app
sudo chown deployer:deployer /opt/app
```

### 3.2. Create a Service User for the Application

```bash
sudo adduser --system --group --no-create-home appuser
```

### 3.3. Create Deployment Script

Create the deployment script that will be called by GitHub Actions:

```bash
sudo nano /opt/app/deploy.sh
```

Add the following content:

```bash
#!/bin/bash

# Deployment script for MyDashboard application
# Usage: ./deploy.sh <commit-sha>

set -e

COMMIT_SHA=$1
APP_NAME="myDashboard"
APP_DIR="/opt/app"
DEPLOY_DIR="$APP_DIR/deploy"
BACKUP_DIR="$APP_DIR/backup"
JAR_PATH="$DEPLOY_DIR/$APP_NAME.jar"
LOG_DIR="/var/log/$APP_NAME"
SERVICE_NAME="mydashboard"

echo "Starting deployment of $APP_NAME (commit: $COMMIT_SHA)"

# Create necessary directories
mkdir -p $DEPLOY_DIR $BACKUP_DIR $LOG_DIR

# Ensure proper permissions
sudo chown -R deployer:deployer $APP_DIR
sudo chown -R appuser:appuser $LOG_DIR

# Move the uploaded JAR to the deployment directory
echo "Moving new JAR to deployment directory"
find $APP_DIR -name "*.jar" -maxdepth 1 -type f -exec mv {} $JAR_PATH \;

# Backup current version if it exists
if [ -f "$JAR_PATH.current" ]; then
  TIMESTAMP=$(date +%Y%m%d%H%M%S)
  echo "Backing up current version"
  cp "$JAR_PATH.current" "$BACKUP_DIR/$APP_NAME-$TIMESTAMP.jar"
fi

# Update the current version
if [ -f "$JAR_PATH" ]; then
  echo "Updating current version"
  cp "$JAR_PATH" "$JAR_PATH.current"
fi

# Update application.properties if needed
# cp $APP_DIR/application-prod.properties $DEPLOY_DIR/application.properties

# Create or update systemd service file
echo "Updating systemd service"
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << EOF
[Unit]
Description=MyDashboard Application
After=network.target

[Service]
User=appuser
Group=appuser
Type=simple
ExecStart=/usr/bin/java -jar $JAR_PATH.current
WorkingDirectory=$DEPLOY_DIR
Environment="SPRING_PROFILES_ACTIVE=prod"
Restart=always
RestartSec=10
StandardOutput=append:$LOG_DIR/application.log
StandardError=append:$LOG_DIR/error.log

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, restart the service
echo "Restarting service"
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl restart $SERVICE_NAME

# Check if service started successfully
sleep 5
if systemctl is-active --quiet $SERVICE_NAME; then
  echo "Deployment successful! Service is running."
else
  echo "ERROR: Service failed to start. Check logs at $LOG_DIR/error.log"
  exit 1
fi

# Clean up old backups (keep last 5)
echo "Cleaning up old backups"
ls -t $BACKUP_DIR/*.jar | tail -n +6 | xargs -r rm

echo "Deployment completed successfully"
```

Make the script executable:

```bash
sudo chmod +x /opt/app/deploy.sh
```

### 3.4. Configure Nginx as a Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/app.zaphrox.de
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or server IP

    location / {
        proxy_pass http://localhost:8080;  # Default Spring Boot port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/app.zaphrox.de /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 4. Set Up GitHub Secrets

In your GitHub repository, go to Settings > Secrets and add the following secrets:

1. `VPS_HOST`: Your server's IP address or domain
2. `SSH_PORT`: SSH port (usually 22)
3. `SSH_KEY`: The private key content (from the key pair you generated earlier)

## 5. Additional Security Measures

### 5.1. Install Fail2Ban to Protect Against Brute Force Attacks

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 5.2. Set Up SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### 5.3. Configure Automatic Security Updates

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 6. Monitoring and Logging

### 6.1. Set Up Basic Monitoring with Prometheus and Grafana (Optional)

```bash
# Install Prometheus
sudo apt install prometheus -y

# Install Grafana
sudo apt-get install -y apt-transport-https software-properties-common
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
sudo apt-get update
sudo apt-get install grafana -y

# Enable and start services
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

### 6.2. Set Up Log Rotation

```bash
sudo nano /etc/logrotate.d/mydashboard
```

Add the following:

```
/var/log/myDashboard/.log {
daily
missingok
rotate 14
compress
delaycompress
notifempty
create 0640 appuser appuser
}
```

## 7. Backup Strategy

### 7.1. Set Up Database Backups

```bash
sudo apt install postgresql-client -y  # For PostgreSQL

# Create backup script
sudo nano /opt/app/backup-db.sh
```

Add the following content (adjust for your database):

```bash
#!/bin/bash
BACKUP_DIR="/opt/app/db-backups"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -h localhost -U dbuser dbname > $BACKUP_DIR/backup-$TIMESTAMP.sql
find $BACKUP_DIR -name "backup-*.sql" -mtime +7 -delete
```

### 7.2 Create a .pgpass file

Create a .pgpass file in the home directory of the user running the script (likely the deployer user):

```bash
sudo -u deployer nano /home/deployer/.pgpass
```

Add a line with this format:

```text
hostname:port:database:username:password
```

For example:

```text
localhost:5432:dbName:dbUser:dbPassword
```

Set proper permissions (important for security):

```bash
sudo -u deployer chmod 600 /home/deployer/.pgpass
```

With this approach PostgreSQL will automatically use the credentials from the .pgpass file.

### 7.3 Make it executable and add to crontab:

```bash
sudo chmod +x /opt/app/backup-db.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/app/backup-db.sh") | crontab -
```

## 8. Testing the Deployment

1. Push a change to your main branch
2. Monitor the GitHub Actions workflow
3. Check the application logs on your server:
   ```bash
   sudo tail -f /var/log/myDashboard/application.log
   ```

## 9. Troubleshooting

If you encounter issues:

1. Check GitHub Actions logs for deployment errors
2. Check application logs: `/var/log/myDashboard/application.log` and `/var/log/myDashboard/error.log`
3. Check systemd service status: `sudo systemctl status mydashboard`
4. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
