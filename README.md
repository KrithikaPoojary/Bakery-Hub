# BakeHub - Online Bakery Marketplace Platform

## 📋 Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Active MongoDB Atlas cluster
- **Git**: Installed on your machine
- **Brevo (Sendinblue)**: SMTP credentials for email OTP verification
- 
## 💻 Local Setup
### 1️⃣ Clone the Repository

git clone https://github.com/KrithikaPoojary/Bakery-Hub.git
cd Bakery-Hub
2️⃣ Backend Setup (backend)
bash
cd backend
npm install
Create a .env file inside backend/:

env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@bakehub.dx6qwwu.mongodb.net/bakehub?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES=7d
# Brevo SMTP Configuration for OTP
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=your_email@gmail.com
Run the backend server:

bash
npm start
# or for development with auto-reload:
npm run dev
3️⃣ Frontend Setup (frontend)
Open a new terminal window:

bash
cd frontend
npm install
Create a .env file inside frontend/:

env
REACT_APP_API_URL=http://localhost:5000/api
Run the React app:

bash
npm start
The app will launch at http://localhost:3000.

🌐 Deployment (Vercel)
This project is configured as a full-stack monorepo deployed directly to Vercel using vercel.json.

1️⃣ Project Settings & Environment Variables
Import the repository on Vercel.
Go to Settings > Environment Variables and add the following keys for Production, Preview, and Development:
MONGO_URI
JWT_SECRET
JWT_EXPIRES (e.g. 7d)
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
EMAIL_FROM
In MongoDB Atlas > Network Access, ensure IP Access is set to 0.0.0.0/0 (Allow access from anywhere).
Click Deploy / Redeploy.
