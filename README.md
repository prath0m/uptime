=== Features of the Project ===

Fully Implemented :
1. URL uptime monitoring :
- [x] Add an url of a deployed website and track for service unavailable error (503)
- [x] Add an url of a deployed website with 'https' (SSL certificate) and track its SSL certificate expiry
- [x] Add an url of a deployed webiste having issued a domain name and track its domain name expiry (not available for website urls with sub-domain names for example : https://demo-website.onrender.com)
- [x] Scheduled checks for all three monitors after every 3 hours
- [x] Incident added for the respective monitors
- [x] Email notifications for every scheduled check (even if the incident is acknowledged)
- [x] Emails are not sent if the incident is marked resolved

Coming Soon Features :
- [] Form teams on the platform by sending invites to users
- [] The whole team is notified for our monitor if an incident occurs
- [] Slack integration for notifications to team
- [] Manage teams by adding or removing members


=== Step by Step Guide for Installing and running the project ===

Adding the .env file :
1. To start the backend, you need to create a .env file first
2. Add the following variables to the .env file
- [x] PORT = 5000 (port number on which your backend will run, keep it 5000 only)
- [x] MONGO_URI (the connection string from your mongo db atlas)
- [x] BASE_URL = http://localhost:5000 (will be different after deployment)
- [x] JWT_SECRET (a large random string for signing JWTs)
- [x] JWT_REFRESH_SECRET (a large random string for refreshing JWTs)
- [x] GMAIL_USER (the email id from which you want to send emails)
- [x] GMAIL_PASSWORD (app password of email id (not the original password))

Installing the dependencies for backend (not to be done when using docker setup) :
> cd backend
> npm install

Installing the dependencies for frontend (not to be done when using docker setup) :
> cd frontend
> npm install

Commands to run Frontend :
> cd frotnend
> npm run dev

Commands to run Backend :
> cd backend
> npm start

For running via Docker, run the command in main project directory (make sure the Docker Desktop is installed and Docker Engine is running) :
> docker-compose up --build

Then go to the http://localhost:5173 on your browser and enjoy!