# Security Configuration and Deployment Guide

## Overview

This document outlines the security measures implemented for the UVA HEESARA Dashboard and provides a step-by-step guide for secure deployment to GitHub Pages.

**🔒 IMPORTANT SECURITY UPDATE**: This dashboard now uses **runtime configuration** instead of build-time environment variables. This means your API URLs are NEVER embedded in the code or committed to Git, ensuring maximum security.

## Security Features Implemented

### 1. Runtime Configuration Loading
- **No Build-Time Secrets**: API endpoints are loaded at runtime, not embedded in builds
- **User-Provided Configuration**: Users configure their own API endpoints through a secure dialog
- **Local Storage**: Configuration is stored securely in the user's browser
- **Multiple Configuration Sources**: Supports config files, local storage, and user input

### 2. Zero-Commit Security
- **No API URLs in Git**: Your API endpoints are never committed to the repository
- **No Environment Variables**: Build process doesn't require any secret environment variables  
- **Template-Based Deployment**: Uses configuration templates instead of actual credentials

### 3. Origin Validation
- **Allowed Origins**: Restricts API access to approved domains
- **Development Mode**: Allows localhost/127.0.0.1 for development
- **Production Mode**: Only allows uvaheesara.uvaarchery.lk domain
- **Multi-Domain Support**: Can be configured for multiple production domains

### 4. Rate Limiting & Abuse Prevention
- **Request Throttling**: Limits to 10 requests per minute per client
- **Automatic Backoff**: Prevents abuse and reduces server load
- **User-Friendly Messages**: Informs users about wait times

### 5. Request Obfuscation
- **URL Fingerprinting**: Adds request fingerprints to API calls
- **Timestamp Parameters**: Prevents request caching/replay
- **Basic Obfuscation**: Makes API endpoints less obvious in network traffic

## Secure Deployment Process

### Step 1: Deploy Without Secrets

1. **Fork/Clone this repository**
2. **Enable GitHub Pages**: Repository → Settings → Pages → Source: "GitHub Actions"
3. **Push to main branch**: No secrets needed! The dashboard will deploy without any API configuration

### Step 2: Configure at Runtime

1. **Visit your deployed dashboard**: `https://yourusername.github.io/repository-name`
2. **The configuration dialog will appear automatically**
3. **Enter your Google Apps Script URL** when prompted
4. **Test the connection** using the built-in validator
5. **Save configuration** - it's stored securely in your browser

### Step 3: Share with Users

Each user who needs access will:
1. Visit the dashboard URL
2. Enter the same Google Apps Script URL when prompted
3. Start using the dashboard immediately

## Configuration Sources (in order of priority)

1. **Config File**: `./config.json` (optional, can be created manually)
2. **Local Storage**: User's browser storage (persistent)
3. **Environment Variables**: Only used in development
4. **User Input**: Configuration dialog prompts for missing config

## Benefits of This Approach

### ✅ Maximum Security
- **Zero Secret Exposure**: No API URLs in Git history, builds, or source code
- **User-Controlled**: Each user manages their own API configuration
- **No Shared Secrets**: No centralized secrets that could be compromised

### ✅ Easy Deployment  
- **No GitHub Secrets**: Deploy without configuring any repository secrets
- **One-Click Deploy**: Push to main branch and it just works
- **No Environment Setup**: No complex environment variable configuration

### ✅ User-Friendly
- **Guided Setup**: Clear instructions for getting Google Apps Script URLs
- **Connection Testing**: Built-in API endpoint validation
- **Error Handling**: Helpful error messages and troubleshooting tips
