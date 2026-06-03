# OM Bulk Deletion Portal

## Project Overview

OM Bulk Deletion Portal is a web-based application that automates the formatting of MSISDN data received in Excel files.

The purpose of the platform is to replace a manual Excel process currently performed by operational teams.

Users upload an Excel file containing MSISDNs, and the system automatically generates two TXT files formatted according to predefined business rules.

The platform does not perform any subscriber deletion or provisioning operation. Its only responsibility is to transform the uploaded data and generate the required output files.

---

# Business Context

Today, operational teams receive Excel files containing large volumes of MSISDNs.

The current manual process is:

1. Receive an Excel file.
2. Open the file in Microsoft Excel.
3. Apply a formatting formula to every MSISDN.
4. Copy the generated results.
5. Create two TXT files manually.
6. Upload those TXT files to another platform for processing.

This process is repetitive, time-consuming, and prone to human error.

The objective of this project is to automate the formatting process through a self-service web portal.

---

# Input File

The uploaded file is an Excel file (.xlsx).

The first column contains MSISDN values.

Example:

| MSISDN    |
| --------- |
| 896811411 |
| 897123456 |
| 898765432 |

Only the first column should be processed.

---

# Data Transformation Rules

For each MSISDN:

Input:

896811411

Transformation:

1. Add a leading zero.
2. Prefix the value with:

DELETE,CUSTOMER,

Output:

DELETE,CUSTOMER,0896811411

---

## Examples

Input:

896811411
897123456
898765432

Output:

DELETE,CUSTOMER,0896811411
DELETE,CUSTOMER,0897123456
DELETE,CUSTOMER,0898765432

---

# Output Files

After processing the uploaded Excel file, the system must generate TWO TXT files containing exactly the same content.

File names:

CDF_Delete_susbs_YYYYMMDD.txt

USD_Delete_susbs_YYYYMMDD.txt

Where:

* YYYY = upload year
* MM = upload month
* DD = upload day

Example:

Upload Date:

2026-05-11

Generated Files:

CDF_Delete_susbs_20260511.txt

USD_Delete_susbs_20260511.txt

Both files contain identical formatted records.

Example Content:

DELETE,CUSTOMER,0896811411
DELETE,CUSTOMER,0897123456
DELETE,CUSTOMER,0898765432

Important:

The file naming convention must be respected exactly.

Use:

susbs

Do not rename it to:

subs
subscribers

because downstream systems may depend on the exact filename.

---

# Main Features

## Authentication

* User login
* Secure authentication
* Session management

## File Upload

* Upload Excel files (.xlsx)
* Validate file format
* Store uploaded file

## File Processing

* Read MSISDNs from the first column
* Apply formatting rules
* Generate output TXT files

## File Download

Users must be able to download:

* CDF_Delete_susbs_YYYYMMDD.txt
* USD_Delete_susbs_YYYYMMDD.txt

## Processing History

Store:

* Upload date
* User
* Original filename
* Processing status
* Generated filenames

---

# Technical Stack

## Frontend

* Next.js
* React
* Tailwind CSS

## Backend

* Node.js
* Express.js

## Database

* MySQL

## File Processing

* ExcelJS

## Authentication

* JWT Authentication

## File Upload

* Multer

---

# High-Level Workflow

User Login
↓
Upload Excel File
↓
Validate File
↓
Read First Column
↓
Format MSISDNs
↓
Generate TXT Content
↓
Create:

* CDF_Delete_susbs_YYYYMMDD.txt
* USD_Delete_susbs_YYYYMMDD.txt
  ↓
  Store Metadata
  ↓
  Allow Download

---

# Suggested Database Tables

## users

Stores application users.

Fields:

* id
* username
* email
* password
* role
* created_at

---

## uploads

Stores uploaded files.

Fields:

* id
* filename
* uploaded_by
* upload_date
* total_records
* status

---

## generated_files

Stores generated file information.

Fields:

* id
* upload_id
* file_type
* generated_filename
* generated_at

---

# API Endpoints

Authentication:

POST /api/auth/login

POST /api/auth/logout

Upload:

POST /api/uploads

History:

GET /api/uploads

GET /api/uploads/:id

Download:

GET /api/files/:id/download

---

# Performance Requirements

The application must support:

* Hundreds of thousands of MSISDNs
* Millions of MSISDNs
* Large Excel files

Requirements:

* Use streaming processing whenever possible
* Avoid loading the entire file into memory
* Optimize TXT generation for large datasets

---

# Security Requirements

* Authenticated access only
* Secure password storage
* JWT-based authentication
* Upload validation
* Protection against unauthorized downloads

---

# Project Goal

Provide a simple and reliable platform that eliminates manual Excel operations by automatically transforming uploaded MSISDN data into standardized TXT files ready for downstream processing.
