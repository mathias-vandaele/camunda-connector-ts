import express from 'express';

const connectorRegistry: ConnectorRecipe[] = [];

interface ConnectorRecipe {
    name: string;
    operation: string;
    handler: (id: number, params: any) => Promise<any>;
    fullPath: string;
}

interface ConnectorArgs {
    name: string;
    operation: string;
}

export function CamundaConnector(connectorArgs: ConnectorArgs) {
    return function (
        originalMethod: any,
        context: ClassMethodDecoratorContext
      ) {
        connectorRegistry.push({
          name: connectorArgs.name,
          operation: connectorArgs.operation,
          handler: originalMethod,
          fullPath: `/csp/${connectorArgs.name}/${connectorArgs.operation}`,
        });
      };
}

interface ServerConfig {
    port: number;
}

export function createConnectorServer(config: ServerConfig) {
    const app = express();
    app.use(express.json());

    const mainRouter = express.Router();

    for (const recipe of connectorRegistry) {
        console.log(`🔨 Registering route for: name => ${recipe.name} | operation => ${recipe.operation}`);
        mainRouter.post(recipe.fullPath, async (req: express.Request, res: express.Response) => {
            const { id, params } = req.body;
            if (id === undefined || params === undefined) {
                return res.status(400).json({ error: "Payload must contain 'id' and 'params'" });
            }
            try {
                const result = await recipe.handler(id, params);
                return res.status(200).json(result);
            } catch (error: any) {
                return res.status(500).json({ error: error.message });
            }
        });
    }

    app.use(mainRouter);

    app.listen(config.port, '0.0.0.0', () => {
        console.log(`🚀 Connector server listening on http://0.0.0.0:${config.port}`);
    });
}