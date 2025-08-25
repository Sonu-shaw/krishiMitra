🌾 KRISHIMITRA – Empowering Farmers with Technology 🌱
══════════════════════════════════════════════════════════════

KrishiMitra is a full-stack web platform designed to help farmers predict
accurate crop prices and connect directly with dealers,
cutting down middlemen and ensuring fair trade.
It uses TensorFlow + LSTM models for price forecasting and a clean React 
frontend with a Flask backend.

✨ Features

✅ AI Price Prediction – Predicts crop prices using LSTM trained on state & district-wise data
👨‍🌾 Farmer Module – Farmers can register, check predictions & sell directly to dealers
🏪 Dealer Module – Dealers can register & manage crop purchase requests
🤖 Chatbot Assistant (Optional) – FAQ/help for farmers
🔐 Secure Auth – JWT-based authentication (Farmer & Dealer roles)
⚡ Stack – React, TailwindCSS, Flask, TensorFlow, MongoDB

📂 Project Structure
KrishiMitra/
 ├── frontend/     ⚛️ React + Tailwind (UI)
 ├── backend/      🐍 Flask + TensorFlow (API + ML)
 │    ├── app.py
 │    ├── models/  (LSTM model, user/dealer schemas)
 │    ├── routes/  (auth, predict, dealers, farmers)
 │    └── ml/      (training scripts + saved model)
 └── README.md

⚙️ Installation & Setup
1️⃣ Clone the Repo
git clone https://github.com/your-username/KrishiMitra.git
cd KrishiMitra

2️⃣ Backend Setup (Flask + ML) 🐍
cd backend
python -m venv venv
# activate venv
venv\Scripts\activate     # Windows  
source venv/bin/activate  # Mac/Linux  

pip install -r requirements.txt


👉 Create a .env file in backend with:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
MODEL_PATH=./ml/artifacts/lstm_model.h5
SCALER_PATH=./ml/artifacts/scaler.pkl
CORS_ORIGINS=http://localhost:3000
PORT=5000


Run the backend:

python app.py


✅ Backend runs on 👉 http://localhost:5000

3️⃣ Frontend Setup (React) ⚛️
cd frontend
npm install


👉 Create a .env in frontend with:

VITE_API_BASE=http://localhost:5000/api


Run the frontend:

npm start


✅ Frontend runs on 👉 http://localhost:3000

🧠 Machine Learning Model

📌 Model – LSTM (Long Short-Term Memory)
📌 Framework – TensorFlow/Keras
📌 Input – Crop + State + District historical price data
📌 Output – Predicted near-term crop price

🔄 Workflow

Preprocess historical data

Train LSTM model (.h5 file saved in ml/artifacts)

Flask API loads model & scaler

Prediction returned as JSON → displayed in React UI

🌐 Deployment

🚀 Frontend → Vercel / Netlify
🚀 Backend → Render / Heroku
☁️ Database → MongoDB Atlas

🔌 API Endpoints

Auth

POST /api/auth/signup – Register farmer/dealer

POST /api/auth/login – Login

GET /api/auth/me – Get user profile

Prediction

POST /api/predict → { crop, state, district } → { predictedPrice }

Dealers

POST /api/dealers – Register dealer

GET /api/dealers?state=XX&district=YY – Get dealers by region

Transactions

POST /api/transactions – Farmer creates sale request

PATCH /api/transactions/:id – Dealer updates status


👨‍💻 Team Members

👤 Aarav Kumar Singh – Backend
👤 Divyanshi Priya – UI/UX Designer
👤 Sujeet Yadav – Cloud Engineer
👤 Sushma Kumari – Machine Learning Engineer
👤 Sonu Kr Shaw – Frontend & Git

🤝 Contributing

🍴 Fork this repo

✨ Create a branch

📝 Commit changes

🚀 Push branch

🎉 Create Pull Request

📜 License

📌 MIT License – Free to use with attribution

⭐ Support

If you like this project, please star ⭐ the repo and share it with others 🙌
