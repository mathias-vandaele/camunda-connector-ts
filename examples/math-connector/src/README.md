# Camunda Connector TypeScript

Une bibliothèque TypeScript simple et élégante pour créer des endpoints HTTP qui s'intègrent avec Camunda BPM. Utilisez des décorateurs pour définir vos connecteurs et laissez la bibliothèque gérer automatiquement l'infrastructure du serveur HTTP.

## Fonctionnalités

- 🎯 **API Simple**: Définissez vos connecteurs avec des décorateurs TypeScript
- 🔄 **Endpoints automatiques**: Génération automatique des routes REST
- 📦 **Type-safe**: Tirez parti du système de types TypeScript
- ⚡ **Async/Await**: Support natif des opérations asynchrones
- 🛠️ **Minimal**: Code boilerplate réduit au minimum
- 🚀 **Express.js**: Construit sur Express.js pour de bonnes performances

## Installation

```bash
npm install camunda-connector-ts
```

## Démarrage Rapide

Voici un exemple complet montrant comment créer des connecteurs pour des opérations mathématiques :

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

// Démarrer le serveur sur le port 8080
createConnectorServer({
    port: 8080
});
```

## Référence API

### `@CamundaConnector` Décorateur

Le décorateur principal pour définir les endpoints de connecteur.

**Paramètres:**
- `name`: Le nom du connecteur (utilisé dans le chemin URL)
- `operation`: Le nom de l'opération (utilisé dans le chemin URL)

**Exigences de la méthode:**
- Doit être `async` ou retourner une `Promise`
- Doit avoir exactement 2 paramètres :
  1. `id: number` - L'ID d'exécution du connecteur
  2. `params: T` - Votre type d'entrée personnalisé
- Doit retourner une `Promise<T>` où `T` est votre type de réponse

**Endpoint généré:**
Chaque connecteur génère un endpoint à `/csp/{name}/{operation}` qui accepte les requêtes POST.

### `createConnectorServer` Fonction

Crée et démarre le serveur HTTP Express.

**Paramètres:**
- `port`: Le numéro de port sur lequel faire tourner le serveur

## Comment ça marche

1. **Enregistrement des connecteurs**: Chaque méthode avec `@CamundaConnector` est automatiquement enregistrée dans le registre global
2. **Génération des routes**: La fonction `createConnectorServer` crée les routes Express pour chaque connecteur
3. **Gestion des requêtes**: Les requêtes JSON entrantes sont automatiquement parsées et passées à vos méthodes
4. **Gestion des réponses**: Les résultats des fonctions sont sérialisés en réponses JSON
5. **Gestion des erreurs**: Les erreurs sont automatiquement converties en réponses HTTP 500

## Endpoints générés

Basé sur l'exemple ci-dessus, les endpoints suivants seraient créés :

- `POST /csp/math/add` - Opération d'addition
- `POST /csp/math/sub` - Opération de soustraction

### Format de requête

```json
{
  "id": 12345,
  "params": {
    "a": 10,
    "b": 5
  }
}
```

### Format de réponse

**Succès (200 OK):**
```json
{
  "result": 15
}
```

**Erreur (400 Bad Request) - Payload invalide:**
```json
{
  "error": "Payload must contain 'id' and 'params'"
}
```

**Erreur (500 Internal Server Error):**
```json
{
  "error": "Message d'erreur"
}
```

## Gestion des erreurs

La bibliothèque gère automatiquement :
- Validation du payload JSON (présence de `id` et `params`)
- Erreurs d'exécution des fonctions (converties en HTTP 500)
- Parsing JSON invalide

Vos méthodes de connecteur peuvent lever des exceptions qui seront automatiquement capturées et retournées comme erreurs HTTP 500.

## Utilisation avancée

### Types d'entrée/sortie personnalisés

Vous pouvez utiliser n'importe quels types TypeScript :

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
        // Votre logique de base de données ici
        const startTime = Date.now();
        
        // Simulation d'une requête
        const rows = await this.executeQuery(params);
        
        return {
            rows,
            count: rows.length,
            executionTime: Date.now() - startTime
        };
    }
    
    private async executeQuery(query: DatabaseQuery): Promise<any[]> {
        // Implémentation de la requête
        return [];
    }
}
```

### Multiples classes de connecteurs

Vous pouvez organiser vos connecteurs en plusieurs classes :

```typescript
export class EmailConnectors {
    
    @CamundaConnector({ name: "email", operation: "send" })
    public async sendEmail(id: number, params: EmailParams): Promise<EmailResult> {
        // Logique d'envoi d'email
    }
    
    @CamundaConnector({ name: "email", operation: "validate" })
    public async validateEmail(id: number, params: EmailValidationParams): Promise<ValidationResult> {
        // Logique de validation d'email
    }
}

export class SlackConnectors {
    
    @CamundaConnector({ name: "slack", operation: "notify" })
    public async notifySlack(id: number, params: SlackParams): Promise<SlackResult> {
        // Logique de notification Slack
    }
}
```

### Configuration du serveur

```typescript
import { createConnectorServer } from 'camunda-connector-ts';

// Instancier vos classes de connecteurs (nécessaire pour l'enregistrement des décorateurs)
new MathConnectors();
new EmailConnectors();
new SlackConnectors();

// Démarrer le serveur
createConnectorServer({
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080
});
```

## Exemple complet

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
        
        // Simulation d'un appel API ou base de données
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
        
        // Logique de création d'utilisateur
        const newUser: User = {
            id: Math.random().toString(36).substring(7),
            ...params
        };
        
        return newUser;
    }
}

// Instancier la classe pour activer les décorateurs
new UserConnectors();

// Démarrer le serveur
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

## Dépendances

- [`express`](https://www.npmjs.com/package/express) - Framework web pour Node.js

## Scripts de développement

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à soumettre une Pull Request.

## Licence

Ce projet est sous licence MIT

## Changelog

### v1.0.0
- Version initiale
- Support des décorateurs de connecteur
- Génération automatique du serveur HTTP
- Support de la gestion d'erreurs