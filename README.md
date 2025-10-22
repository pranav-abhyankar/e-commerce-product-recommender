# 🛍️ E-commerce Product Recommender

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-black?logo=flask)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![Anthropic](https://img.shields.io/badge/Claude%20API-LLM-orange?logo=anthropic)
![License](https://img.shields.io/badge/License-MIT-green)

>  *An AI-powered recommendation engine combining data-driven insights with LLM-generated explanations for a personalized e-commerce experience.* 💡

---

## 🧭 Table of Contents
- [📘 Overview](#-overview)
- [✨ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [🚀 Setup Instructions](#-setup-instructions)
- [🔗 API Endpoints](#-api-endpoints)
- [💻 Using the Dashboard](#-using-the-dashboard)
- [📸 Preview](#-preview)
- [⚖️ License](#-license)

---

## 📘 Overview

The **E-commerce Product Recommender** is an advanced AI system that intelligently suggests products to users based on their browsing and purchase history.  
It integrates a **Flask backend** for recommendation logic, a **React frontend** for an interactive UI, and **Anthropic Claude LLM** to generate natural, human-like explanations for each recommendation — answering *“Why this product?”* 🧠

---

## ✨ Features

✅ **Personalized Recommendations** — Dynamic suggestions based on user activity  
🧩 **LLM-Powered Explanations** — Each recommendation includes an AI-generated reason  
🖥️ **Interactive Frontend Dashboard** — Clean, dark-themed interface built in React  
⚙️ **RESTful API** — Flask backend serving product data and user tracking  
📊 **User Insights** — Profile view with favorite categories, purchases, and views  

---

## 🧰 Tech Stack

| Layer | Technology | Description |
|-------|-------------|-------------|
| 🎨 **Frontend** | ReactJS | Interactive dashboard (`App.jsx`) |
| ⚙️ **Backend** | Python Flask | REST API for recommendation logic (`app.py`) |
| 🧠 **LLM Integration** | Anthropic Claude API | Generates contextual explanations |
| 💾 **Database** | In-memory Dict | Simulated dataset for users and products |

---

## 🚀 Setup Instructions

Follow these steps to get your project running locally 👇

### 🔹 1. Clone the Repository

git clone https://github.com/yourusername/ecommerce-recommender.git

cd ecommerce-recommender

### 🔹 2. Backend Setup (Flask)

Create a virtual environment and install dependencies:

python3 -m venv venv
source venv/bin/activate         
On Windows: 
.\venv\Scripts\activate

pip install flask flask-cors numpy anthropic


Set your Claude API key (required for explanations):
export ANTHROPIC_API_KEY="your_api_key_here"


Run the backend:
python app.py


The API server will run on http://localhost:5000

### 🔹 3. Frontend Setup (React)

Navigate to your frontend folder:

cd frontend
npm install
npm start


The React app will run on http://localhost:3000

---

## 🔗 API Endpoints
Endpoint	Method	Description

/api/products	GET	Fetch all products

/api/products/<product_id>	GET	Get details of a specific product

/api/user/<user_id>/track	POST	Record user interactions (view/purchase)

/api/recommendations/<user_id>?count=n	GET	Fetch n personalized recommendations

/api/user/<user_id>/profile	GET	Retrieve user’s behavior summary

/api/health	GET	API health check endpoint

---

## 🧾 Example request:

POST /api/user/user_001/track

Content-Type: application/json

{

  "product_id": "P005",
  
  "type": "purchase"
  
}

---

### 💻 Using the Dashboard

Once both servers are running:

Open 🌐 http://localhost:3000

Enter a User ID or click Random User

In Explore, click 👁️ View or 🛒 Buy to simulate interactions

Switch to Recommendations to view AI-driven suggestions 🤖

Check Profile to view your stats, categories & purchase history 📊

---

### 📸 Preview

🪄 Three intuitive dashboard tabs for a seamless user experience.

### 🔍 Explore

Browse and interact with products in the catalog.

### 🎯 Recommendations

View AI-generated personalized product suggestions with clear explanations.

### 👤 Profile

Check user stats — viewed/purchased products and top categories.

---

## ⚖️ License

This project is licensed under the MIT License.
🪶 Feel free to modify and use this project for learning, research, or development purposes.

---
⭐ If you like this project, don’t forget to star it on GitHub! ⭐
