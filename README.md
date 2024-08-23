# Classifier
The classifier is an open-source model training platform which can be integrated with JIRA and Outlook to deploy custom classification models to classify and label incoming emails or JIRA tickets.

# Scope

This repo will primarily contain:

1. Architectural and other documentation (under the documentation folder);
2. Docker Compose file to set up and run Classifier as a fully functional service;
3. You can view the UI designs for this project in this [Figma file](https://www.figma.com/design/VWoZu2s7auo7YTw49RqNtV/Estonian-Classifier-English-Version?node-id=712-1695&t=cx6ZZVuEkfWqlbZB-1)


## Instructions for MacOs Users
#### TODO - Include instructions for MacOS users to delete specific parts of the base image to make the build work

## Version 
##### TODO - Talk about programming language versions and framework versions used in the project here

## Dev setup

- Clone [Ruuter](https://github.com/buerokratt/Ruuter)
- Navigate to Ruuter and build the image `docker build -t ruuter .`
- Clone [Resql](https://github.com/buerokratt/Resql)
- Navigate to Resql and build the image `docker build -t resql .`
- Clone [Data Mapper](https://github.com/buerokratt/DataMapper)
- Navigate to Data Mapper and build the image `docker build -t data-mapper .`
- Clone [TIM](https://github.com/buerokratt/TIM)
- Navigate to TIM and build the image `docker build -t tim .`
- Clone [Authentication Layer](https://github.com/buerokratt/Authentication-layer)
- Navigate to Authentication Layer and build the image  `docker build -f Dockerfile.dev -t authentication-layer .`
- Clone [S3 Ferry](https://github.com/buerokratt/S3-Ferry)
- Navigate to S3-Ferry and build the image `docker build  -t s3-ferry .`
- Clone [Cron Manager](https://github.com/rootcodelabs/CronManager) (<i>This is a forked repo of the original Buerokratt CronManager with a Python environment included</i>)
- Navigate to Cron Manager dev branch and build the cron-manager-python image `docker build -f Dockerfile.python -t cron-manager-python .`

## Give execution permission for all mounted shell scripts
- Navigate to the parent folder of the classifier project and run the below command to make the shell files executable
- `find classifier -type f -name "*.sh" -exec chmod +x {} \;`

### Refresh Token setup

- Navigate to outlook-consent-app folder
- setup environment variables in .env file
    - NEXT_PUBLIC_CLIENT_ID
    - CLIENT_SECRET
    - REDIRECT_URI = http://localhost:3003/callback
- build and run image using `docker compose up -d`  
- copy the token from app and set it in constant.ini file under the key `OUTLOOK_REFRESH_KEY`

### Database setup

- For setting up the database initially, run helper script `./token.sh`
- Then setup database password in constant.ini under the key DB_PASSWORD
- Run migrations added in this repository by running the helper script `./migrate.sh`(consider db properties before run the script)
- When creating new migrations, use the helper `./create-migration.sh name-of-migration sql` which will create a new file in the correct directory and add the required headers, pass file name(ex: data-model-sessions) and the format(sql or xml) as inputs

### Open Search

- To Initialize Open Search run `./deploy-opensearch.sh <URL> <AUTH> <Is Mock Allowed - Default false>`
- To Use Opensearch locally run `./deploy-opensearch.sh http://localhost:9200 admin:admin true`

### Outlook Setup
- Register Application in Azure portal
  -  Supported account types - Supported account types
  - Redirect URI platform - Web
- Client ID, Client Secret should be set in constant.ini under OUTLOOK_CLIENT_ID and OUTLOOK_SECRET_KEY
- Navigate CronManger/config folder and add Client ID, Client Secret values in config.ini file also 
- Set the value of `CLASSIFIER_RUUTER_PUBLIC_FRONTEND_URL` in constant.ini - Allowing it to be accessed from the internet for validating Outlook subscription.

### Jira Setup

- Navigate to https://id.atlassian.com/manage-profile
- Log in with your JIRA credentials and click on security tab
- Scroll down to API token section and then click `Create and manage API tokens---> Create API Token`
- Navigate to Jira Account(This is the Account where jira issue create and prediction happen)
- Then go to settings--> system--> webHooks
- create webhook
      - url - `Base_URL/classifier/integration/jira/cloud/accept`
      - click issue created,updated check boxes
- Set Values in Constant.ini
     - JIRA_API_TOKEN
     - JIRA_USERNAME
     - JIRA_CLOUD_DOMAIN
     - JIRA_WEBHOOK_ID


### Notes

-To get Jira webhook id ,can use below CURL request with valid credentials

`curl -X GET \
-u your-email@example.com:your-api-token \
-H "Content-Type: application/json" \
JIRA_CLOUD_DOMAIN/rest/webhooks/1.0/webhook`
- self attribute has the id
     - example: "self": "https://example.net/rest/webhooks/1.0/webhook/1
    - webhook id: 1

##### Ruuter Internal Requests

- When running ruuter either on local or in an environment make sure to adjust `- application.internalRequests.allowedIPs=127.0.0.1,{YOUR_IPS}` under ruuter environments

## Ngrok setup for local testing
#### Explain about Setting up ngrok to test in localhost
