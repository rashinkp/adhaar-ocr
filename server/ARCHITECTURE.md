# Clean Architecture - Aadhaar OCR System

## 🏗️ Architecture Overview

This Aadhaar OCR system has been refactored to follow **Clean Architecture** principles with proper separation of concerns, dependency injection, and testable components.

## 📁 Folder Structure

```
src/
├── controllers/           # Express controllers (HTTP layer)
│   └── AadhaarController.ts
├── routes/               # Express route definitions
│   └── aadhaar.routes.ts
├── services/             # Business logic layer
│   └── AadhaarService.ts
├── repositories/         # Data access layer
│   └── AadhaarRepository.ts
├── providers/            # External service providers
│   └── ocr/
│       ├── IOcrProvider.ts
│       └── TesseractOcrProvider.ts
├── dto/                  # Data Transfer Objects
│   └── AadhaarDto.ts
├── models/               # Database schemas
│   └── Aadhaar.ts
├── mappers/              # Data transformation layer
│   └── AadhaarMapper.ts
├── utils/                # Pure utility functions
│   └── aadhaarParser.ts
├── config/               # Configuration files
├── middleware/           # Express middleware
└── app.ts               # Dependency injection & app setup
```

## 🔧 Architecture Components

### 1. **Models** (Database Layer)
- **Aadhaar.ts**: Mongoose schema definition
- Direct interaction with MongoDB
- No business logic

### 2. **Repositories** (Data Access Layer)
- **AadhaarRepository.ts**: Class-based repository
- Works directly with Mongoose schemas
- Returns raw schema documents or plain objects
- Handles all database operations

### 3. **DTOs** (Data Transfer Objects)
- **AadhaarDto.ts**: Defines structure for frontend communication
- Pure interfaces with no business logic
- Type-safe data contracts

### 4. **Mappers** (Data Transformation)
- **AadhaarMapper.ts**: Converts between Schema ↔ DTO
- Stateless transformation functions
- Handles data format conversions

### 5. **Providers** (External Services)
- **IOcrProvider.ts**: Interface for OCR providers
- **TesseractOcrProvider.ts**: Tesseract.js implementation
- Easily swappable for other OCR services (Google Vision, AWS Textract)

### 6. **Utils** (Pure Functions)
- **aadhaarParser.ts**: Stateless parsing functions
- Regex-based Aadhaar text extraction
- No dependencies on external services

### 7. **Services** (Business Logic)
- **AadhaarService.ts**: Orchestrates the complete flow
- Constructor dependency injection
- Coordinates: OCR → Parse → Save → Transform
- Returns only DTOs to controllers

### 8. **Controllers** (HTTP Layer)
- **AadhaarController.ts**: Express request/response handling
- No business logic
- Uses services and returns DTOs
- Proper error handling and logging

## 🔄 Data Flow

```
Request → Controller → Service → Provider → Utils → Repository → Database
                ↓
Response ← DTO ← Mapper ← Schema ← Repository ← Database
```

## 🚀 Key Features

### ✅ **Clean Architecture Principles**
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Single Responsibility**: Each class has one reason to change
- **Interface Segregation**: Small, focused interfaces
- **Dependency Injection**: Constructor-based DI

### ✅ **No Entity Classes**
- Uses Mongoose schemas as persistence layer
- Repository directly interacts with schemas
- Mappers handle Schema ↔ DTO conversion

### ✅ **Swappable OCR Providers**
- `IOcrProvider` interface allows easy swapping
- Current: `TesseractOcrProvider`
- Future: Google Vision, AWS Textract, etc.

### ✅ **Pure Business Logic**
- Utils are stateless and testable
- Services orchestrate without side effects
- Controllers only handle HTTP concerns

## 🔌 Dependency Injection Setup

```typescript
// app.ts - Dependency wiring
const aadhaarRepository = new AadhaarRepository();
const tesseractOcrProvider = new TesseractOcrProvider("eng");
const aadhaarService = new AadhaarService(aadhaarRepository, tesseractOcrProvider);
const aadhaarController = new AadhaarController(aadhaarService);
```

## 📡 API Endpoints

- `POST /api/ocr` - Process Aadhaar images
- `GET /api/search` - Find Aadhaar record
- `GET /api/records` - Get all records
- `DELETE /api/records/:aadhaarNumber` - Delete record

## 🧪 Testing Strategy

Each layer can be tested independently:
- **Unit Tests**: Utils, Mappers, Services
- **Integration Tests**: Repository with test database
- **Contract Tests**: Providers with mock implementations
- **E2E Tests**: Full API workflows

## 🔮 Future Enhancements

1. **Additional OCR Providers**: Google Vision, AWS Textract
2. **Caching Layer**: Redis for frequently accessed records
3. **Validation Layer**: Joi/Zod for request validation
4. **Event System**: Domain events for audit logging
5. **Repository Interface**: Abstract repository for multiple data sources

## 🚀 Benefits

- **Maintainable**: Clear separation of concerns
- **Testable**: Each component can be tested in isolation
- **Scalable**: Easy to add new features and providers
- **Flexible**: OCR provider can be swapped without changing business logic
- **Type-Safe**: Full TypeScript coverage with proper interfaces
