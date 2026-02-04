# 🧠 Brain MRI Tumor Classification System

![Project Banner](https://img.shields.io/badge/AI-Healthcare-blue?style=for-the-badge&logo=ai)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)

An end-to-end intelligent diagnostic system leveraging **Convolutional Neural Networks (CNN)** to classify Brain MRI scans. This project combines a high-performance deep learning backend with a modern, reactive web interface to assist in the early detection of brain tumors.

---

## 🚀 Project Overview

The **Brain MRI Classifier** is designed as a decision-support tool for medical professionals. It processes raw MRI images to determine the presence of a tumor with calculated confidence intervals. 



### Key Features:
* **Automated Classification:** Binary classification (Tumor vs. Healthy).
* **Instant Inference:** Real-time processing via a high-performance FastAPI backend.
* **Modern UI:** A sleek, glassmorphic dashboard built with React and Tailwind CSS.
* **Visual Feedback:** Probability bars and detailed diagnostic reports for each scan.

---

## 🏗️ Model Architecture

The core of the system is the **CNN_TUMOR** architecture, custom-built using PyTorch:

-   **Input Layer:** Accepts $256 \times 256$ RGB images.
-   **Feature Extraction:** 4 Sequential Convolutional Layers increasing in depth (8 → 16 → 32 → 64 filters) to capture intricate spatial hierarchies.
-   **Activation:** **ReLU** units used throughout for non-linear mapping and faster convergence.
-   **Regularization:** **Dropout ($0.25$)** applied to the fully connected layers to prevent overfitting.
-   **Output:** Softmax-based final layer for binary probability distribution.



---

## 👥 Meet the Team

This project was developed by a multidisciplinary team of engineers who collaborated to bridge the gap between Deep Learning and Web Development:

| Member Name | Role & Responsibility | GitHub Profile |
| :--- | :--- | :--- |
| **Fatima Alzahraa** | Data Scientist / Preprocessing | [@username](https://github.com/username) |
| **Adel Tamer** | AI Architect / Model Design | [@adelbadran](https://github.com/adelbadran) |
| **Alaa Hamed** | AI Engineer / Model Training | [@username](https://github.com/username) |
| **Hasnaa Mohamed** | Frontend Developer / UI-UX | [@HasnaaMohamed206](https://github.com/HasnaaMohamed206) |
| **Doha Mohamed** | Full-Stack Engineer / API DevOps | [@DohaMohamed12](https://github.com/DohaMohamed12) |

 
---

## 🛠️ Tech Stack

### **Backend & AI**
* **Python / PyTorch:** Model development and training.
* **FastAPI:** Asynchronous API gateway for low-latency inference.
* **Torchvision:** Image preprocessing, resizing, and normalization using ImageNet statistics.

### **Frontend**
* **Next.js / React:** Responsive and dynamic user interface.
* **Tailwind CSS:** Modern styling and dark-mode optimization.
* **Lucide React:** High-quality iconography.

---

## 💻 Installation & Setup

### 1. Backend Setup
Ensure the pre-trained weights (`cnn_model.pth`) are placed in the server directory.
```bash
# Install dependencies
pip install torch torchvision fastapi uvicorn pillow python-multipart

# Start the API server
uvicorn api_server:app --reload


