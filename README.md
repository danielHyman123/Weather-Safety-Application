# 🌪️ Weather Safety Application

A full-stack Django web application that allows users to track their friends' locations in real-time and alerts them if those friends are within or near current disaster zones. This project uses the **Kontur Disaster API** for live hazard data and **Leaflet.js** for interactive mapping.

---

## 🧭 Overview

Market research shows that during emergencies, users frequently switch between location-sharing apps and weather apps to track both people and hazardous conditions. Yhis platform aims to combine both concepts into one 

> ✅ Built for emergency awareness.  
> ✅ Easily see who is in danger zones.  
> ✅ Invite and monitor friends securely.

---

## 🚀 Features

- Add friends with geolocation (latitude/longitude)
- Displays friends on an interactive map
- View live disaster data on the map from Kontur API
- Alert users if any friends are within disaster zones
- Simple and intuitive UI

---

## 🛠️ Tech Stack

**Frontend**
- HTML / CSS / JS
- Leaflet.js library (maps)

**Backend**
- Django
- Django REST Framework
- Shapely / GeoJSON parsing

**APIs**
- Kontur Disaster API (real-time hazards)

---

## ⚙️ Setup Instructions

 1. Clone the repo.
    
 2. Obtain API key from Kontur.io and implement it in a config.json in static folder

 3. Install django, django reactframe form

 4. Run 'python manage.py runserver' to open a local port
