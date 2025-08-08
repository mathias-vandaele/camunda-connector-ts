# Camunda Connector TypeScript

A TypeScript/Node.js library for building Camunda connectors with decorator-based routing and automatic request dispatching.

## Features

- **Decorator-Based Connectors**: Use TypeScript decorators to define connectors with minimal boilerplate
- **Automatic Request Dispatching**: Built-in Express.js server with intelligent routing
- **Type Safety**: Full TypeScript support with strongly-typed interfaces
- **Class-Based Organization**: Organize related connectors in classes
- **Middleware Support**: Built-in middleware for operation routing
- **Simple Setup**: Quick server creation with minimal configuration

## Installation

```bash
npm install camunda-connector-ts express
npm install -D @types/express typescript
```

## Quick Start

### Basic Example

```typescript
import { createConnectorServer, CamundaConnector } from 'camunda-connector-ts';

// Define your input/output interfaces
interface MathInput {
    a: number;
    b: number;
}

interface MathOutput {
    result: number;
}

// Create a connector class
export class MathConnectors {
    
    @CamundaConnector({ name: "math", operation: "add" })
    public async add(id: number, params: MathInput): Promise<MathOutput> {
        console.log(`[Executing] add for task ${id}`);
        return {
            result: params.a + params.b
        };
    }

    @CamundaConnector({ name: "math", operation: "subtract" })
    public async subtract(id: number, params: MathInput): Promise<MathOutput> {
        console.log(`[Executing] subtract for task ${id}`);
        return {
            result: params.a - params.b
        };
    }
}

// Start the server
createConnectorServer({
    port: 8080
});
```

## Usage

### Defining Connectors

Use the `@CamundaConnector` decorator to define connector methods:

```typescript
@CamundaConnector({ name: "connector_name", operation: "operation_name" })
public async handlerMethod(id: number, params: InputType): Promise<OutputType> {
    // Your connector logic here
    return result;
}
```

**Requirements:**
- Methods must be `async` and return a `Promise`
- Must take exactly 2 parameters: `id: number` and `params: any` (or your specific type)
- Must be public methods in a class
- TypeScript experimental decorators must be enabled

### TypeScript Configuration

Ensure your `tsconfig.json` has experimental decorators enabled:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2020",
    "module": "commonjs",
    "strict": true
  }
}
```

### Starting the Server

Use `createConnectorServer()` to start the Express.js server:

```typescript
createConnectorServer({
    port: 8080
});
```

The server will automatically:
- Register all decorated connector methods
- Set up Express.js with JSON parsing
- Create routes for each connector
- Handle request dispatching and error responses

### Request Format

Connectors expect HTTP POST requests to `/csp/{connector_name}` with JSON payload:

```json
{
    "id": 12345,
    "params": {
        "operation": "operation_name",
        "input": {
            // Your connector-specific input data
        }
    }
}
```

### Response Format

Successful responses return JSON with your connector's output data:

```json
{
    "result": 42
}
```

Error responses return appropriate HTTP status codes:
- **400 Bad Request**: Missing `id` or `params` in payload
- **404 Not Found**: Unknown connector or operation
- **500 Internal Server Error**: Handler method threw an error

## How It Works

### Decorator Registration

The `@CamundaConnector` decorator:

1. **Registers Handlers**: Adds connector metadata to a global registry
2. **Creates Middleware**: Generates Express middleware for operation routing
3. **Builds Paths**: Constructs REST endpoints (`/csp/{name}`)

### Request Flow

1. HTTP POST request arrives at `/csp/{connector_name}`
2. Middleware checks the `operation` field in the request body
3. If operation matches, the request continues to the handler
4. If operation doesn't match, Express tries the next route
5. Handler method is called with `id` and `params.input`
6. Response is automatically serialized and returned

### Registry System

The connector registry stores:

```typescript
interface ConnectorRecipe {
    name: string;           // Connector name
    operation: string;      // Operation identifier
    handler: Function;      // Your decorated method
    middleware: Function;   // Generated routing middleware
    fullPath: string;       // Full Express route path
}
```

## Advanced Usage

### Multiple Connectors

Organize related operations in classes:

```typescript
export class StringConnectors {
    
    @CamundaConnector({ name: "string", operation: "uppercase" })
    public async toUpperCase(id: number, params: { text: string }): Promise<{ result: string }> {
        return { result: params.text.toUpperCase() };
    }
    
    @CamundaConnector({ name: "string", operation: "reverse" })
    public async reverse(id: number, params: { text: string }): Promise<{ result: string }> {
        return { result: params.text.split('').reverse().join('') };
    }
}

export class MathConnectors {
    
    @CamundaConnector({ name: "math", operation: "power" })
    public async power(id: number, params: { base: number, exponent: number }): Promise<{ result: number }> {
        return { result: Math.pow(params.base, params.exponent) };
    }
}
```

### Custom Input/Output Types

Define strongly-typed interfaces for better development experience:

```typescript
interface EmailInput {
    to: string[];
    subject: string;
    body: string;
    attachments?: string[];
}

interface EmailOutput {
    messageId: string;
    status: 'sent' | 'failed';
    timestamp: Date;
}

export class EmailConnector {
    
    @CamundaConnector({ name: "email", operation: "send" })
    public async sendEmail(id: number, params: EmailInput): Promise<EmailOutput> {
        // Email sending logic here
        return {
            messageId: `msg_${Date.now()}`,
            status: 'sent',
            timestamp: new Date()
        };
    }
}
```

### Error Handling

Handle errors in your connector methods:

```typescript
@CamundaConnector({ name: "api", operation: "fetch" })
public async fetchData(id: number, params: { url: string }): Promise<any> {
    try {
        const response = await fetch(params.url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        // Error will be automatically converted to 500 response
        throw new Error(`Failed to fetch data: ${error.message}`);
    }
}
```

## Server Configuration

The server configuration accepts additional options:

```typescript
createConnectorServer({
    port: 8080,
    // Additional Express configuration can be added here
});
```

## Development

### Running in Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Run the server
node dist/index.js
```

### Testing Connectors

Test your connectors with curl:

```bash
curl -X POST http://localhost:8080/csp/math \
  -H "Content-Type: application/json" \
  -d '{
    "id": 123,
    "params": {
      "operation": "add",
      "input": {
        "a": 5,
        "b": 3
      }
    }
  }'
```

## Dependencies

This library uses the following key dependencies:

- **Express.js**: For HTTP server and routing
- **TypeScript**: For type safety and decorators

## Comparison with Rust Version

| Feature | TypeScript | Rust |
|---------|------------|------|
| Syntax | Decorators | Procedural Macros |
| Runtime | Node.js | Native Binary |
| Type Safety | Compile-time + Runtime | Compile-time |
| Server | Express.js | Axum |
| Registration | Runtime Registry | Compile-time Inventory |
| Performance | Good | Excellent |
| Memory Usage | Higher | Lower |

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]