# Capstone 2 - E-Commerce REST API

A functional e-commerce REST API built . It uses Node.js, Express, MongoDB, and Mongoose to manage products.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- Postman

## Project Structure

```text
capstone-2-ecommerce-api/
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
└── README.md
```

## Installation

1. Clone the repository.
2. Open the project in VS Code.
3. Run `npm install`.
4. Create `.env` in the project root.
5. Add:

```env
PORT=5000
MONGO_URI=your_connection_string
```

6. Run `npm run dev`.
7. Open `http://localhost:5000`.

Never commit the real `.env` file or database credentials.

## Base URL

```text
http://localhost:5000
```

## Product Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/products` | Create a product |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | View one product |
| PATCH | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

## Search / Filter

```text
GET /api/products?category=Accessories
GET /api/products?search=mouse
GET /api/products?category=Accessories&search=wireless
```

## Example Request Body

```json
{
  "name": "Mechanical Keyboard",
  "description": "RGB keyboard",
  "price": 1850,
  "category": "Accessories",
  "stock": 12
}
```

## Expected Status Codes

- `200 OK` - successful GET, PATCH, or DELETE
- `201 Created` - successful POST
- `400 Bad Request` - missing/invalid input or malformed ID
- `404 Not Found` - product does not exist
- `500 Server Error` - unexpected backend failure

## Postman

Import `postman/MSTCONNECT-Capstone-2-API.postman_collection.json`. Set `baseUrl` to `http://localhost:5000`.

The collection includes CRUD requests plus failure-case requests for missing name, negative price, invalid ID, missing product, and deleting a missing product.

## CRUD Test Flow

```text
POST → copy ID → GET → PATCH → GET → DELETE → GET
```

The final GET should return `404 Not Found`.

## Search / Filter Practice

Create at least 5 products using at least 2 categories. Verify category filtering, case-insensitive keyword search, combined filters, and the unfiltered product list.

## GitHub Safety Checklist

Before pushing:

```bash
git status
git add .
git status
git commit -m "Build product REST API with validation"
git push
```

Confirm `.env` is not staged, `node_modules` is ignored, the README is updated, the API starts successfully, Postman requests are saved, and no passwords/tokens appear in source files.
