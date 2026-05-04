# 🚀 Blockchain + IoT Based Supply Chain Tracker

> A smart supply chain monitoring system using IoT sensors for real-time tracking and secure data handling concepts.

![Status](https://img.shields.io/badge/status-active-success)
![Frontend](https://img.shields.io/badge/frontend-React-blue)
![Backend](https://img.shields.io/badge/backend-Node.js-green)
![Database](https://img.shields.io/badge/database-MongoDB-brightgreen)
![IoT](https://img.shields.io/badge/iot-ESP32-orange)

---

## 📌 Overview

This project is designed to improve **transparency, traceability, and product safety** in supply chains.

It uses **IoT sensors (ESP32)** to monitor environmental conditions like temperature and humidity, and a **web dashboard** to track and visualize data in real time.

> 🔗 Blockchain integration is planned to ensure immutable and tamper-proof records.

---

## 🎥 Demo

👉 Add your demo link here  
(e.g., YouTube / Google Drive)

---

## 📸 Screenshots
![Login]
<img width="1536" height="755" alt="Screenshot 2026-04-09 095248" src="https://github.com/user-attachments/assets/57533b9b-c9ae-4e52-abdd-dddca3511a3b" />
![LandingPage]
<img width="1918" height="1029" alt="Screenshot 2026-04-09 092151" src="https://github.com/user-attachments/assets/f08c4d82-80af-4f4d-b788-f75c335f448e" />
### 📊 Dashboard
![Farmer]
<img width="1210" height="794" alt="Screenshot 2026-04-09 103842" src="https://github.com/user-attachments/assets/382c1506-29ef-4fec-b9c3-3617b15d4ebe" />
![Distributer]
<img width="1079" height="802" alt="Screenshot 2026-04-09 100127" src="https://github.com/user-attachments/assets/aa93b6e6-7d34-4fae-b383-c3c2441a14ff" />
![Warehouse]
<img width="791" height="770" alt="Screenshot 2026-04-09 094858" src="https://github.com/user-attachments/assets/05b30fb9-fd9d-443a-94e6-a05ec5827d79" />
![Retailer]
<img width="918" height="800" alt="Screenshot 2026-04-09 111642" src="https://github.com/user-attachments/assets/d27ed416-e1dd-49ba-9975-5581b70e5365" />
![Admin]
<img width="1911" height="1012" alt="Screenshot 2026-04-09 093125" src="https://github.com/user-attachments/assets/3af82587-d1f6-4710-8961-65864117b599" />
![Product verification page]
<img width="1327" height="720" alt="Screenshot 2026-04-09 095852" src="https://github.com/user-attachments/assets/cea29347-67c1-4d99-b44d-9f8e84d1fd47" />


## 🎯 Key Features

- 🔐 Role-based authentication (Admin / Stakeholders)
- 📦 Batch tracking across supply chain stages
- 🌡️ Real-time temperature & humidity monitoring
- 📍 Location tracking (GPS-based)
- ⚠️ Alert system for abnormal conditions
- 📊 Interactive charts and dashboard
- 📄 Sensor data history & logs
- 🔗 Blockchain integration (Planned)

---

## 🧠 Problem Statement

Traditional supply chains lack:
- Transparency
- Real-time monitoring
- Trust between stakeholders

This can lead to:
- Product spoilage
- Data manipulation
- Inefficient tracking

---

## 💡 Solution

This system provides:
- Real-time monitoring using IoT
- Centralized data tracking via backend APIs
- Visualization through a web dashboard
- Future scope for blockchain-based data integrity

---

## 🔄 Data Flow

1. ESP32 collects sensor data (temperature, humidity, etc.)
2. Data is sent to backend via REST API
3. Backend processes and stores data in MongoDB
4. Frontend fetches and displays data in real time
5. Alerts are triggered when thresholds are exceeded

---

## 🏗️ Architecture
ESP32 Sensors
↓
Node.js Backend (API)
↓
MongoDB Database
↓
React Dashboard
↓
(Blockchain Layer - Future)



---

## 🛠️ Tech Stack

### 💻 Frontend
- React.js
- Tailwind CSS
- Recharts
- React Leaflet

### ⚙️ Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### 📡 IoT
- ESP32
- DHT22 Sensor
- GPS Module
- Vibration Sensor
- Light Sensor

---

## 📡 API Endpoints

### ➤ Add Sensor Data
POST /api/sensor

```json
{
  "temperature": 25,
  "humidity": 60,
  "location": "12.9716,77.5946"
}



---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Ganesanpa/supply-chain-iot-blockchain.git
cd supply-chain-iot-blockchain

2️⃣ Backend

cd server
npm install
npm start

3️⃣ Frontend
cd client
npm install
npm run dev<img width="1370" height="919" alt="Screenshot 2026-04-09 095314" src="https://github.com/user-attachments/assets/d1d1bb95-3b93-42fb-80db-fa984803c5b0" />
