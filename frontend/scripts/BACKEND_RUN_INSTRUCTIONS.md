# DFU Detection Backend - Windows Setup Guide

This guide explains how to set up and run the DFU detection backend server on Windows.

## Folder Structure

After setup, your folder should look like this:

```
dfu_backend/
├── dfu_backend_server.py    # The Flask server script
├── requirements.txt          # Python dependencies
├── dfu_model.tflite         # YOUR MODEL FILE (place here!)
└── .venv/                    # Virtual environment (created in step 2)
```

## Prerequisites

- **Python 3.8 or higher** installed on your system
- **dfu_model.tflite** - Your trained TensorFlow Lite model file

---

## Step 1: Create Project Folder

Open **Command Prompt** or **PowerShell** and run:

```cmd
mkdir C:\dfu_backend
cd C:\dfu_backend
```

Copy these files to `C:\dfu_backend`:
- `dfu_backend_server.py`
- `requirements.txt`
- `dfu_model.tflite` ← **IMPORTANT: Place your model here!**

---

## Step 2: Create Virtual Environment

In the `C:\dfu_backend` folder, run:

```cmd
python -m venv .venv
```

This creates a `.venv` folder containing the isolated Python environment.

---

## Step 3: Activate Virtual Environment

**For Command Prompt (cmd.exe):**
```cmd
.venv\Scripts\activate.bat
```

**For PowerShell:**
```powershell
.venv\Scripts\Activate.ps1
```

> **Note:** If PowerShell shows an execution policy error, run this first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

When activated, you'll see `(.venv)` at the beginning of your command prompt.

---

## Step 4: Install Dependencies

With the virtual environment activated, run:

```cmd
pip install -r requirements.txt
```

This installs:
- Flask (web server)
- flask-cors (cross-origin requests)
- tensorflow (TFLite runtime)
- Pillow (image processing)
- numpy (numerical operations)

**Expected output:**
```
Successfully installed Flask-3.0.0 Pillow-10.2.0 ...
```

---

## Step 5: Verify Model File Location

**CRITICAL:** Make sure `dfu_model.tflite` is in the same folder as `dfu_backend_server.py`.

Verify with:
```cmd
dir C:\dfu_backend
```

You should see:
```
dfu_backend_server.py
requirements.txt
dfu_model.tflite      ← Must be here!
```

---

## Step 6: Find Your Local IP Address

Run this command to find your computer's IP address:

```cmd
ipconfig
```

Look for the **IPv4 Address** under your active network adapter:

```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100  ← This is your IP
```

**Write down this IP address** - you'll need it for the mobile app.

---

## Step 7: Start the Backend Server

With the virtual environment activated, run:

```cmd
python dfu_backend_server.py
```

**Expected output:**
```
============================================================
  DFU DETECTION BACKEND SERVER
============================================================

============================================================
MODEL LOADED SUCCESSFULLY
============================================================
Input shape:  [1, 224, 224, 3]
Input dtype:  <class 'numpy.float32'>
Output shape: [1, 2]
Output dtype: <class 'numpy.float32'>
============================================================

NETWORK INFORMATION:
----------------------------------------
Local IP Address: 192.168.1.100
Server URL: http://192.168.1.100:5000

UPDATE YOUR MOBILE APP:
  BACKEND_BASE_URL = 'http://192.168.1.100:5000'
----------------------------------------

Starting server on http://0.0.0.0:5000
Press Ctrl+C to stop.
```

---

## Step 8: Update the Mobile App

In your React Native app, open `services/ulcerClassifier.ts` and update line 15:

```typescript
// Change this:
const BACKEND_BASE_URL = 'http://YOUR_LAPTOP_IP:5000';

// To your actual IP (example):
const BACKEND_BASE_URL = 'http://192.168.1.100:5000';
```

---

## Step 9: Test the Server

Open a web browser and go to:

```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_path": "C:\\dfu_backend\\dfu_model.tflite",
  "model_exists": true
}
```

---

## Troubleshooting

### "Model not loaded" error
- Make sure `dfu_model.tflite` is in `C:\dfu_backend`
- The filename must be exactly `dfu_model.tflite`

### "Connection refused" on mobile app
- Check that both devices are on the same Wi-Fi network
- Verify the IP address is correct
- Make sure Windows Firewall allows Python through (it may prompt you)

### PowerShell execution policy error
Run as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### pip install fails
Upgrade pip first:
```cmd
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## Quick Start Summary

```cmd
# One-time setup
cd C:\dfu_backend
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt

# Run server (every time)
cd C:\dfu_backend
.venv\Scripts\activate.bat
python dfu_backend_server.py
```

---

## API Reference

### POST /predict

**Request:**
```json
{
  "image": "BASE64_ENCODED_IMAGE_STRING"
}
```

**Response:**
```json
{
  "ulcer_type": "Healthy",
  "confidence": 0.9234,
  "processing_time_ms": 156
}
```

### GET /health

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_path": "C:\\dfu_backend\\dfu_model.tflite",
  "model_exists": true
}
```
