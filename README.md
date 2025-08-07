# Camunda Connector TypeScript

A simple and elegant TypeScript library for creating HTTP endpoints that integrate with Camunda BPM. Use TypeScript decorators to define your connectors and let the library automatically handle the HTTP server infrastructure.

## Features

- 🎯 **Simple API**: Define connectors with TypeScript decorators
- 🔄 **Automatic endpoints**: Auto-generated REST routes
- 📦 **Type-safe**: Leverage TypeScript's type system
- ⚡ **Async/Await**: Native support for asynchronous operations
- 🛠️ **Minimal**: Reduced boilerplate code
- 🚀 **Express.js**: Built on Express.js for great performance

## Installation

```bash
npm install camunda-connector-ts
```

## Quick Start

Here's a complete example showing how to create connectors for mathematical operations:

```typescript
import { createConnectorServer, CamundaConnector } from 'camunda-connector-ts';

interface MyInput {
    a: number;
    b: number;
}

interface MyOutput {
    result: number;
}

export class MathConnectors {

    @CamundaConnector({ name: "math", operation: "add" })
    public async add(id: number, params: MyInput): Promise<MyOutput> {
        console.log(`[add] id: ${id}, params:`, params);
        return {
            result: params.a + params.b
        };
    }

    @CamundaConnector({ name: "math", operation: "sub" })
    public async subtract(id: number, params: MyInput): Promise<MyOutput> {
        console.log(`[sub] id: ${id}, params:`, params);
        return {
            result: params.a - params.b
        };
    }
}

// Start the server on port 8080
createConnectorServer({
    port: 8080
});
```

## API Reference

### `@CamundaConnector` Decorator

The main decorator for defining connector endpoints.

**Parameters:**
- `name`: The connector name (used in the URL path)
- `operation`: The operation name (used in the URL path)

**Method Requirements:**
- Must be `async` or return a `Promise`
- Must have exactly 2 parameters:
  1. `id: number` - The connector execution ID
  2. `params: T` - Your custom input type
- Must return a `Promise<T>` where `T` is your response type

**Generated Endpoint:**
Each connector generates an endpoint at `/csp/{name}/{operation}` that accepts POST requests.

### `createConnectorServer` Function

Creates and starts the Express HTTP server.

**Parameters:**
- `port`: The port number to run the server on

## How It Works

1. **Connector Registration**: Each method with `@CamundaConnector` is automatically registered in the global registry
2. **Route Generation**: The `createConnectorServer` function creates Express routes for each connector
3. **Request Handling**: Incoming JSON requests are automatically parsed and passed to your methods
4. **Response Handling**: Function results are serialized to JSON responses
5. **Error Handling**: Errors are automatically converted to HTTP 500 responses

## Generated Endpoints

Based on the example above, the following endpoints would be created:

- `POST /csp/math/add` - Addition operation
- `POST /csp/math/sub` - Subtraction operation

### Request Format

```json
{
  "id": 12345,
  "params": {
    "a": 10,
    "b": 5
  }
}
```

### Response Format

**Success (200 OK):**
```json
{
  "result": 15
}
```

**Error (400 Bad Request) - Invalid payload:**
```json
{
  "error": "Payload must contain 'id' and 'params'"
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "Error message"
}
```

## Error Handling

The library automatically handles:
- JSON payload validation (presence of `id` and `params`)
- Function execution errors (converted to HTTP 500)
- Invalid JSON parsing

Your connector methods can throw exceptions that will be automatically caught and returned as HTTP 500 errors.

## Advanced Usage

### Custom Input/Output Types

You can use any TypeScript types:

```typescript
interface DatabaseQuery {
    table: string;
    conditions: string[];
    limit?: number;
}

interface DatabaseResult {
    rows: any[];
    count: number;
    executionTime: number;
}

export class DatabaseConnectors {
    
    @CamundaConnector({ name: "database", operation: "query" })
    public async queryDatabase(id: number, params: DatabaseQuery): Promise<DatabaseResult> {
        // Your database logic here
        const startTime = Date.now();
        
        // Query simulation
        const rows = await this.executeQuery(params);
        
        return {
            rows,
            count: rows.length,
            executionTime: Date.now() - startTime
        };
    }
    
    private async executeQuery(query: DatabaseQuery): Promise<any[]> {
        // Query implementation
        return [];
    }
}
```

### Multiple Connector Classes

You can organize your connectors in multiple classes:

```typescript
export class EmailConnectors {
    
    @CamundaConnector({ name: "email", operation: "send" })
    public async sendEmail(id: number, params: EmailParams): Promise<EmailResult> {
        // Email sending logic
    }
    
    @CamundaConnector({ name: "email", operation: "validate" })
    public async validateEmail(id: number, params: EmailValidationParams): Promise<ValidationResult> {
        // Email validation logic
    }
}

export class SlackConnectors {
    
    @CamundaConnector({ name: "slack", operation: "notify" })
    public async notifySlack(id: number, params: SlackParams): Promise<SlackResult> {
        // Slack notification logic
    }
}
```

### Server Configuration

```typescript
import { createConnectorServer } from 'camunda-connector-ts';

// Instantiate your connector classes (required for decorator registration)
new MathConnectors();
new EmailConnectors();
new SlackConnectors();

// Start the server
createConnectorServer({
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080
});
```

## Complete Example

```typescript
import { createConnectorServer, CamundaConnector } from 'camunda-connector-ts';

interface UserRequest {
    userId: string;
    includeProfile?: boolean;
}

interface User {
    id: string;
    name: string;
    email: string;
    profile?: UserProfile;
}

interface UserProfile {
    bio: string;
    location: string;
    joinDate: Date;
}

export class UserConnectors {
    
    @CamundaConnector({ name: "user", operation: "get" })
    public async getUser(id: number, params: UserRequest): Promise<User> {
        console.log(`[getUser] Processing request ${id} for user ${params.userId}`);
        
        // Simulate API call or database query
        const user: User = {
            id: params.userId,
            name: "John Doe",
            email: "john.doe@example.com"
        };
        
        if (params.includeProfile) {
            user.profile = {
                bio: "Software developer",
                location: "Paris, France",
                joinDate: new Date('2023-01-15')
            };
        }
        
        return user;
    }
    
    @CamundaConnector({ name: "user", operation: "create" })
    public async createUser(id: number, params: Omit<User, 'id'>): Promise<User> {
        console.log(`[createUser] Creating user for request ${id}`);
        
        // User creation logic
        const newUser: User = {
            id: Math.random().toString(36).substring(7),
            ...params
        };
        
        return newUser;
    }
}

// Instantiate the class to activate decorators
new UserConnectors();

// Start the server
createConnectorServer({
    port: 8080
});
```

## Architecture

```
┌─────────────────┐    HTTP POST     ┌─────────────────┐
│   Camunda BPM   │ ───────────────► │  Connector API  │
│                 │                  │                 │
└─────────────────┘                  └─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │ Express Router  │
                                    │                 │
                                    └─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │ Method Handler  │
                                    │ (@Decorator)    │
                                    └─────────────────┘
```

## Dependencies

- [`express`](https://www.npmjs.com/package/express) - Web framework for Node.js

## Development Scripts

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License

## Changelog

### v1.0.0
- Initial release
- Connector decorator support
- Automatic HTTP server generation
- Error handling support