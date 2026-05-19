# Scalable E-Commerce Microservice Platform

A production-ready microservice architecture built with TypeScript and Node.js, demonstrating modern backend development practices for distributed e-commerce systems.

## 🎯 Overview

This project implements a comprehensive microservice-based e-commerce platform featuring multiple independent services communicating through event-driven architecture. It showcases best practices in service-oriented architecture (SOA), containerization, and distributed system design.

## ✨ Key Features

- **Microservice Architecture**: Independently deployable services for Auth, Product, Inventory, Order, Cart, Email, and User management
- **Event-Driven Communication**: Services communicate asynchronously via event streaming
- **API Gateway**: Centralized entry point for routing and load balancing
- **Database Per Service**: Independent databases (PostgreSQL with Prisma ORM) for each microservice
- **Redis Integration**: High-performance caching and session management
- **TypeScript**: Full type safety across the entire stack
- **Docker Containerization**: Complete Docker Compose setup for local development and deployment
- **Email Service**: Automated email notifications and communications
- **Authentication & Authorization**: Secure JWT-based authentication with verification flow

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                              │
│              (Routing, Authentication, Logging)              │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬──────────┬──────────┐
    │             │             │          │          │
┌───▼──┐  ┌──────▼─┐  ┌─────────▼─┐  ┌───▼──┐  ┌────▼───┐
│ Auth │  │Product │  │ Inventory │  │Order │  │ Email  │
└──────┘  └────────┘  └───────────┘  └──────┘  └────────┘
    │             │             │          │          │
    └─────────────┼─────────────┴──────────┴──────────┘
                  │
    ┌─────────────┼────────────┐
    │             │            │
┌───▼─────┐  ┌───▼────┐  ┌───▼───┐
│ PostgreSQL │ │ Redis  │  │ Event │
│  (Auth)    │ │ (Cart) │  │ Bus   │
└────────┘  └────────┘  └───────┘
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Language** | TypeScript |
| **Runtime** | Node.js |
| **API Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Caching** | Redis |
| **Containerization** | Docker & Docker Compose |
| **Package Manager** | npm |

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Docker** & **Docker Compose** (v20+)
- **PostgreSQL** (v14+) - included in Docker Compose
- **Redis** (v7+) - included in Docker Compose

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Sharif-2020331049/Scalable-Ecommerce-Practice-Microservice-.git
cd Practice-Microservice
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install dependencies for each service
npm install --workspace=api-gateway
npm install --workspace=services/auth
npm install --workspace=services/cart
npm install --workspace=services/email
npm install --workspace=services/inventory
npm install --workspace=services/order
npm install --workspace=services/product
npm install --workspace=services/user
```

### 3. Setup Environment Variables

Create `.env` files for each service with required configurations:

```bash
# Example .env structure for services
DATABASE_URL=postgresql://user:password@localhost:5432/service_name
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h
EMAIL_SERVICE_URL=http://email:3006
API_GATEWAY_URL=http://localhost:3000
```

### 4. Start Services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- All microservices
- API Gateway

### 5. Verify Services are Running

```bash
# Check running containers
docker-compose ps

# Test API Gateway
curl http://localhost:3000/health
```

## 📁 Project Structure

```
Practice-Microservice/
├── api-gateway/                 # API Gateway service
│   ├── src/
│   │   ├── config.json         # Configuration settings
│   │   ├── index.ts            # Gateway entry point
│   │   ├── middlewares.ts       # Authentication, logging, CORS
│   │   └── utils.ts            # Helper functions
│   └── package.json
│
├── services/
│   ├── auth/                    # Authentication & Authorization
│   │   ├── src/
│   │   │   ├── controllers/    # Login, registration, verification
│   │   │   ├── schemas.ts      # Request validation schemas
│   │   │   └── prisma.ts       # Database client
│   │   └── prisma/             # Database schema & migrations
│   │
│   ├── product/                 # Product Catalog Management
│   │   ├── src/
│   │   │   ├── controllers/    # CRUD operations
│   │   │   ├── schemas.ts
│   │   │   └── prisma.ts
│   │   └── prisma/
│   │
│   ├── inventory/               # Stock & Inventory Management
│   │   ├── src/
│   │   │   ├── controller/     # Stock updates, tracking
│   │   │   ├── schemas.ts
│   │   │   └── prisma.ts
│   │   └── prisma/
│   │
│   ├── order/                   # Order Processing
│   │   ├── src/
│   │   │   ├── controller/     # Order creation, management
│   │   │   ├── schemas.ts
│   │   │   └── prisma.ts
│   │   └── prisma/
│   │
│   ├── cart/                    # Shopping Cart with Redis
│   │   ├── src/
│   │   │   ├── controllers/    # Add, remove, clear operations
│   │   │   ├── events/         # Expiration handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── redis.ts        # Redis client configuration
│   │   │   └── schema.ts
│   │   └── package.json
│   │
│   ├── email/                   # Email Service
│   │   ├── src/
│   │   │   ├── controllers/    # Email sending logic
│   │   │   ├── schemas.ts
│   │   │   └── prisma.ts
│   │   └── prisma/
│   │
│   └── user/                    # User Profile Management
│       ├── src/
│       │   ├── controllers/    # Profile CRUD operations
│       │   ├── schemas.ts
│       │   └── prisma.ts
│       └── prisma/
│
├── docker-compose.yaml          # Multi-container orchestration
├── package.json                 # Root package configuration
└── README.md                    # This file
```

## 🔧 Service Details

### Auth Service (Port 3001)
- User registration and login
- JWT token generation and validation
- Email verification workflows
- Password management

### Product Service (Port 3002)
- Product catalog management
- Product search and filtering
- Category management
- Pricing and availability

### Inventory Service (Port 3003)
- Real-time stock management
- Inventory tracking
- Low stock alerts
- Stock reservation

### Order Service (Port 3004)
- Order creation and processing
- Order history and tracking
- Payment integration
- Order fulfillment

### Cart Service (Port 3005)
- Shopping cart management
- Redis-backed session storage
- Cart persistence
- Automated expiration

### Email Service (Port 3006)
- Email notifications
- Verification emails
- Order confirmations
- Transactional emails

### User Service (Port 3007)
- User profile management
- User preferences
- Account settings

### API Gateway (Port 3000)
- Request routing and load balancing
- Authentication middleware
- Rate limiting and logging
- CORS configuration

## 📊 Key Technologies & Patterns

### Design Patterns
- **Service Locator**: Service discovery and registration
- **Event-Driven Architecture**: Asynchronous communication between services
- **Database Per Service**: Data isolation and independence
- **API Gateway Pattern**: Single entry point for clients
- **Circuit Breaker**: Fault tolerance and resilience

### Best Practices
- **Type Safety**: Full TypeScript implementation
- **Validation**: Input schema validation using Prisma and custom validators
- **Error Handling**: Centralized error handling middleware
- **Logging**: Structured logging across services
- **Security**: JWT authentication, input sanitization
- **Scalability**: Stateless services for horizontal scaling

## 📈 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Email verification
- `POST /auth/verify-token` - Token validation

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Cart
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add to cart
- `DELETE /cart/items/:id` - Remove from cart
- `DELETE /cart` - Clear cart

### Orders
- `POST /orders` - Create order
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order status

## 🧪 Testing

```bash
# Run tests for a specific service
npm test --workspace=services/auth

# Run all tests
npm test
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Input Validation**: Request schema validation
- **CORS Protection**: Cross-Origin Resource Sharing configuration
- **Rate Limiting**: Prevent brute force attacks
- **SQL Injection Prevention**: Parameterized queries via Prisma

## 📦 Deployment

### Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service_name]
```

### Scaling Services

```bash
# Scale a specific service
docker-compose up -d --scale cart=3
```

## 🔄 CI/CD Pipeline

The project is configured for continuous integration with:
- Automated testing on pull requests
- Code quality checks
- Docker image building
- Automated deployment to staging/production

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Maintain consistent indentation (2 spaces)
- Use async/await over promises when possible

## 📚 Learning Resources

- [Microservices Architecture](https://microservices.io/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🐛 Known Issues & Limitations

- Single database per service (can be distributed further)
- Basic event bus implementation (consider Kafka or RabbitMQ for production)
- Rate limiting currently in-memory (use Redis for distributed rate limiting)

## 🚧 Future Enhancements

- [ ] Kubernetes deployment configuration
- [ ] Service mesh implementation (Istio)
- [ ] Advanced monitoring and observability (Prometheus, Grafana)
- [ ] Message queue integration (Kafka/RabbitMQ)
- [ ] Distributed tracing (Jaeger)
- [ ] GraphQL API layer
- [ ] Mobile app backend integration
- [ ] Real-time notifications (WebSockets)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sharif-2020331049**

- GitHub: [@Sharif-2020331049](https://github.com/Sharif-2020331049)
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/your-profile)

## 📞 Support

For support, email [your-email@example.com](mailto:your-email@example.com) or open an issue in the repository.

---

**Built with ❤️ using TypeScript, Node.js, and modern microservice architecture principles.**
