# 🛒 E-Commerce REST API

A functional **E-Commerce REST API** built with **Node.js, Express.js, MongoDB, and Mongoose**.  
This project demonstrates RESTful API development, product CRUD operations, validation, filtering, error handling, Postman testing, MongoDB Atlas integration, and Vercel deployment.

## 🚀 Live API

**Production API:**  
https://ecommerce-api-bmorta.vercel.app/

### Available Production Routes

```text
GET https://ecommerce-api-bmorta.vercel.app/
GET https://ecommerce-api-bmorta.vercel.app/api/health
GET https://ecommerce-api-bmorta.vercel.app/api/products
```

The API is deployed on **Vercel** and connected to **MongoDB Atlas**.

---

## 🛠️ Technologies

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **CORS**
- **dotenv**
- **Postman**
- **Vercel**
- **MongoDB Atlas**

---

## ✨ Features

- RESTful API architecture
- Product CRUD operations
- Product validation
- Search products by keyword
- Filter products by category
- Combined search and category filtering
- Centralized error handling
- MongoDB database integration
- Environment variable protection
- CORS support for frontend integration
- Health-check endpoint
- Local development support
- Production deployment with Vercel
- MongoDB Atlas cloud database

---

## 📂 Project Structure

```text
ecommerce-api/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── productController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   └── Product.js
│   ├── routes/
│   │   └── productRoutes.js
│   └── server.js
├── postman/
│   └── MSTCONNECT-Capstone-2-API.postman_collection.json
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Bmorta/ecommerce-api.git
cd ecommerce-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the `.env` file

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

### 4. Start the development server

```bash
npm run dev
```

The local API will run at:

```text
http://localhost:5000
```

### 5. Start the production server locally

```bash
npm start
```

---

## 🔐 Environment Variables

The application uses environment variables for configuration.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

### Security

Never commit the real `.env` file to GitHub.

The `.gitignore` file includes:

```gitignore
node_modules/
.env
.DS_Store
```

**Do not expose MongoDB usernames, passwords, connection strings, API keys, or other secrets in source code or screenshots.**

---

# 📡 API Endpoints

## Root

### `GET /`

Checks whether the API is running.

### Local

```text
GET http://localhost:5000/
```

### Production

```text
GET https://ecommerce-api-bmorta.vercel.app/
```

Example response:

```json
{
  "success": true,
  "message": "E-commerce API is running"
}
```

---

## Health Check

### `GET /api/health`

Checks whether the API is healthy.

### Production

```text
GET https://ecommerce-api-bmorta.vercel.app/api/health
```

Example response:

```json
{
  "success": true,
  "message": "API is healthy"
}
```

---

# 📦 Product Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/products` | Create a product |
| `GET` | `/api/products` | Get all products |
| `GET` | `/api/products/:id` | Get one product |
| `PATCH` | `/api/products/:id` | Update a product |
| `DELETE` | `/api/products/:id` | Delete a product |

---

## ➕ Create Product

### `POST /api/products`

Example request:

```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical keyboard",
  "price": 1850,
  "category": "Accessories",
  "stock": 12
}
```

Expected status:

```text
201 Created
```

---

## 📋 Get All Products

### `GET /api/products`

Local:

```text
http://localhost:5000/api/products
```

Production:

```text
https://ecommerce-api-bmorta.vercel.app/api/products
```

---

## 🔎 Search and Filter

The API supports product filtering using query parameters.

### Filter by category

```text
GET /api/products?category=Accessories
```

### Search by keyword

```text
GET /api/products?search=mouse
```

### Combine category and search

```text
GET /api/products?category=Accessories&search=wireless
```

---

## 🔍 Get Product by ID

### `GET /api/products/:id`

Example:

```text
GET /api/products/PRODUCT_ID
```

---

## ✏️ Update Product

### `PATCH /api/products/:id`

Example:

```text
PATCH /api/products/PRODUCT_ID
```

Example request body:

```json
{
  "price": 1999,
  "stock": 20
}
```

Expected status:

```text
200 OK
```

---

## 🗑️ Delete Product

### `DELETE /api/products/:id`

Example:

```text
DELETE /api/products/PRODUCT_ID
```

Expected status:

```text
200 OK
```

---

# 📊 Expected Status Codes

| Status | Meaning |
|---|---|
| `200 OK` | Successful GET, PATCH, or DELETE |
| `201 Created` | Successful POST |
| `400 Bad Request` | Missing or invalid input / malformed ID |
| `404 Not Found` | Product does not exist |
| `500 Server Error` | Unexpected backend/database failure |

---

# 🧪 Postman Testing

The project includes a Postman collection:

```text
postman/MSTCONNECT-Capstone-2-API.postman_collection.json
```

## Local Postman Base URL

```text
http://localhost:5000
```

## Production Postman Base URL

```text
https://ecommerce-api-bmorta.vercel.app/
```

The collection can be used to test:

- Create product
- Get all products
- Get product by ID
- Update product
- Delete product
- Validation errors
- Invalid IDs
- Missing products
- Search
- Category filtering
- Combined filters

---

# 🔄 CRUD Test Flow

Recommended testing sequence:

```text
POST
  ↓
Copy Product ID
  ↓
GET
  ↓
PATCH
  ↓
GET
  ↓
DELETE
  ↓
GET
```

The final `GET` request should return:

```text
404 Not Found
```

This confirms that the product was successfully deleted.

---

# 🔎 Search / Filter Practice

For testing the filtering functionality:

1. Create at least 5 products.
2. Use at least 2 different categories.
3. Test category filtering.
4. Test keyword searching.
5. Test combined category + keyword filtering.
6. Test the unfiltered product list.

Examples:

```text
/api/products?category=Accessories
/api/products?search=keyboard
/api/products?category=Accessories&search=wireless
/api/products
```

---

# ☁️ Deployment

This API is deployed using **Vercel**.

### Deployment Architecture

```text
Frontend / Postman
        │
        ▼
      Vercel
        │
        ▼
 Node.js + Express API
        │
        ▼
 MongoDB Atlas
```

### Deployment Workflow

```text
Local Development
       ↓
Test API
       ↓
MongoDB Atlas
       ↓
GitHub Repository
       ↓
Vercel
       ↓
Production API
```

The project uses Vercel to host the Express API while MongoDB Atlas provides the cloud database.

---

## 🌐 Frontend Integration

A separate frontend can consume this API by using the production API URL instead of the local server.

### Local development

```javascript
const API = "http://localhost:5000/api/products";
```

### Production

```javascript
const API = "https://ecommerce-api-bmorta.vercel.app/api/products";
```

The backend has CORS enabled so it can be accessed by a separately deployed frontend.

---

# 🗄️ Database

The API uses:

- **MongoDB** as the database
- **Mongoose** as the ODM
- **MongoDB Atlas** for the deployed cloud database

The MongoDB connection string is stored in the `MONGO_URI` environment variable.

---

# 🧩 NPM Scripts

```bash
npm run dev
```

Starts the application using **Nodemon** for development.

```bash
npm start
```

Starts the application using Node.js.

---

# 🛡️ GitHub Safety Checklist

Before pushing changes to GitHub:

```bash
git status
git add .
git status
git commit -m "Update README and API documentation"
git push
```

Confirm that:

- `.env` is not staged.
- `node_modules` is ignored.
- No database passwords are committed.
- No API keys or tokens are committed.
- The API starts successfully.
- Postman requests are saved.
- The README reflects the current API.
- The production API is accessible.

---

# 📌 Project Information

**Project:** E-Commerce REST API  
**Backend:** Node.js + Express.js  
**Database:** MongoDB + MongoDB Atlas  
**ODM:** Mongoose  
**Testing:** Postman  
**Deployment:** Vercel  

---

# 🔗 Links

### GitHub Repository

https://github.com/Bmorta/ecommerce-api

### Live API

https://ecommerce-dvu6gsn7j-bmorta.vercel.app

### Production Products Endpoint

https://ecommerce-api-bmorta.vercel.app/api/products

---

# 👩‍💻 Author

**Brigitte Morta**

GitHub:  
https://github.com/Bmorta

---

## 📄 License

This project was created as part of the **Full-Stack Web Development Bootcamp** and is intended for educational and portfolio purposes.
