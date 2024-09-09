# Classifier
The classifier is an open-source model training platform which can be integrated with JIRA and Outlook to deploy custom classification models to classify and label incoming emails or JIRA tickets.

# Scope

This repo will primarily contain:


1. Architecture and other documentation (under the documentation folder);
2. Docker Compose file to set up and run Classifier as a fully functional service;
3. You can view the UI designs for this project in this [Figma file](https://www.figma.com/design/VWoZu2s7auo7YTw49RqNtV/Estonian-Classifier-English-Version?node-id=712-1695&t=cx6ZZVuEkfWqlbZB-1)


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
- Navigate to Authentication Layer, checkout to the `dev` branch and build the image  `docker build -f Dockerfile.dev -t authentication-layer .`
- Clone [S3 Ferry](https://github.com/buerokratt/S3-Ferry)
- Navigate to S3-Ferry and build the image `docker build  -t s3-ferry .`
- Clone [Cron Manager](https://github.com/rootcodelabs/CronManager) (<i>This is a forked repo of the original Buerokratt CronManager with a Python environment included</i>)
- Navigate to Cron Manager dev branch and build the cron-manager-python image `docker build -f Dockerfile.python -t cron-manager-python .`
- Replace the existing values in the Cron Manager config.ini file with the correct values for `OUTLOOK_CLIENT_ID` and `OUTLOOK_SECRET_KEY`

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

### Setting up Microsoft Outlook Integration

1. **Sign in to Azure Portal**
    - Navigate to [Azure Portal](https://portal.azure.com) and log in.
    - Click on **Manage Microsoft Entra ID**.
![1](https://github.com/user-attachments/assets/abd47d5c-65ab-47b8-a0a7-dd7199055ac2)

2. **App Registration**
    - In the left-hand side menu, under the **Manage** section, select **App Registration**.
    - Click on the **New registration** button.
      ![3](https://github.com/user-attachments/assets/5be4b8b4-f2c7-459a-965b-96239d5e884a)
    - Provide a **Name** and select the **Account type** as required.
    - In the **Redirect URI** section, select **Web** and enter the callback URL of the Outlook consent app. 
      If deployed locally, the callback URL will be `http://localhost:3003/callback`.
![4](https://github.com/user-attachments/assets/1e246ca8-c37d-4fd1-93b6-61946cb0c9be)

3. **Copy OUTLOOK_CLIENT_ID**
    - After registering, you can find the **Application (Client) ID** as the **OUTLOOK_CLIENT_ID**. 
    - Copy this value and replace it in both the `constants.ini` file and the `DSL/CronManager/config/config.ini` file.

4. **Add Client Secret**
    - On the same page, navigate to the **Client credentials** section and click on **Add a certificate or secret**.
      ![5](https://github.com/user-attachments/assets/59a07937-db39-471c-9c32-d1091a8dc91b)
      
    - Select **Client secrets** and click on **New Client secret**. Provide a description and select an expiration time.
    - Once created, copy the **Value** field, which will serve as the **OUTLOOK_SECRET_KEY**. 
    - Add this value to the `constants.ini` and `DSL/CronManager/config/config.ini` files.
![7](https://github.com/user-attachments/assets/f2652f83-82ed-4013-a163-45143193bb91)

5. **Acquire OUTLOOK_REFRESH_KEY**
    - Navigate to the `outlook-consent-app` folder.
    - Set up the environment variables in the `.env` file as follows:
      ```
      NEXT_PUBLIC_CLIENT_ID=<OUTLOOK_CLIENT_ID>
      CLIENT_SECRET=<OUTLOOK_SECRET_KEY>
      REDIRECT_URI=http://localhost:3003/callback
      ```

6. **Run Docker Compose**
    - Build and run the image using the command:
      ```bash
      docker compose up -d
      ```
    - Open `http://localhost:3003` in your browser and log into your Outlook account.
    - After logging in, you will be redirected to a blank page. Copy the URL of this page. 
      It will look something like this:
      ```
      http://localhost:3003/callback?code=0.AXAAXGBxHHHLM0KSn6K5P11VEwd6OmhayyZPkKWeDQbMwB7EADY.AgABBAIAAAApTwJmzXqdR4BN2miheQMYAwDs_wUA9P8YgyUBDQvsq47v6moXRoIHTkHmo10LAbOgZS9kgj6Dnu1wkGQRw8WOYJMBDaQgT85jC4oIGAPvET02ZEhdalGcVZveRaULfWnFz7MMrV1R17xr73yAuF5ZEKNSivDqZ9Bq9U7qbVuykvzghVtZXiZJWfl3wSS7SJTaZl6lvSwj-ce_4piRoMXE8UI3ae-I88eAHqpDewH5b4zsVO7ouqEgEhIXHd2B6KKKrgUGW1KQsKxI_UZ89C8Uj23ISB1fecpMA&state=12345&session_state=ce84abb3-4466-493f-afc5-506d002f9617
      ```

7. **Extract OUTLOOK_REFRESH_KEY**
    - Remove the `http://localhost:3003/callback?code=` part from the URL, and the remaining string will be your **OUTLOOK_REFRESH_KEY**.
    - Add this value to the `constants.ini` file and the `DSL/CronManager/config/config.ini` files.



### Jira Setup

1. **Generate API Token:**
   - Navigate to [Atlassian Profile](https://id.atlassian.com/manage-profile) and log in with your Jira credentials.
   - Click on the **Security** tab.
   - Scroll down to the **API Token** section, and click on `Create and manage API tokens`.
   - Click on `Create API Token` to generate a new token. **This token will serve as your `JIRA_API_TOKEN`.** Make sure to store it securely as it will be used later.

2. **Create Jira Webhook:**
   - Navigate to your **Jira Account** (This is where Jira issues will be created and predicted).
   - Go to **Settings → System → WebHooks**.
   - Click `Create WebHook` and configure it as follows:
     - **URL**: `Base_URL/webhook` (Replace `Base_URL` with the actual URL of your `jira-verification` container deployed in your infrastructure).
     - Under Events, select the checkboxes for `Issue Created` and `Issue Updated` to trigger the webhook upon these actions.
     - **Webhook Secret**: After creating the webhook, you will receive a `JIRA_WEBHOOK_SECRET`. **Save this secret as you will need to add it to your configuration files.**

3. **Set Values in `constants.ini`:**
   - Add the following values in your `constants.ini` file:
     - `JIRA_API_TOKEN` – The API token generated in step 1.
     - `JIRA_USERNAME` – Your Jira username. To find your Jira username, navigate to your profile in Jira, and it will be displayed under your account information.
     - `JIRA_CLOUD_DOMAIN` – The domain URL of your Jira cloud instance (e.g., `https://example.atlassian.net`).
     - `JIRA_WEBHOOK_ID` – You can retrieve this using the steps below.

4. **Create a `.env` file for Jira Configuration:**
   - Create a `.env` file called `jira_config.env` and add the following:
     ```env
     JIRA_WEBHOOK_SECRET=<<JIRA_WEBHOOK_SECRET>>
     ```

### Retrieving Jira Webhook ID

To get the `JIRA_WEBHOOK_ID`, use the following CURL request with your Jira email and API token:

```bash
curl -X GET -u your-email@example.com:your-api-token -H "Content-Type: application/json" https://<JIRA_CLOUD_DOMAIN>/rest/webhooks/1.0/webhook
```

In the response, the webhook ID can be found in the `self` attribute. For example:

```json
"self": "https://example.net/rest/webhooks/1.0/webhook/1"
```

In this case, the `JIRA_WEBHOOK_ID` is `1`.

5. **Final Configuration:**
   - Add the following values to your `constants.ini` file:
     - `JIRA_API_TOKEN`
     - `JIRA_USERNAME`
     - `JIRA_CLOUD_DOMAIN`
     - `JIRA_WEBHOOK_ID`
     - `JIRA_WEBHOOK_SECRET`

Ensure these values are properly configured before proceeding.

##### Ruuter Internal Requests

- When running ruuter either on local or in an environment make sure to adjust `- application.internalRequests.allowedIPs=127.0.0.1,{YOUR_IPS}` under ruuter environments

## Ngrok setup for local testing
To setup JIRA and Outlook integrations locally you need an https URL as a webhook. Since localhost by default http JIRA and Outlook APIs wouldn't be able to call your webhook endpoint if it's in localhost. You can overcome this by creating a ngrok tunnel to your localhost ports 3008 (JIRA Integration) and 8086 (Outlook Integration). And then provide the https URLs you receive from ngrok as webhook callback endpoints in JIRA and Outlook configurations
