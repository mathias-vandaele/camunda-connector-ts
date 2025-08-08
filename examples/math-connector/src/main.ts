import { createConnectorServer } from 'camunda-connector-ts';
import { CamundaConnector } from "camunda-connector-ts"


interface MyInput {
    a: number;
    b: number;
}

interface MyOutput {
    c: number;
}

export class MyConnectors {

    @CamundaConnector({ name: "math", operation: "add" })
    public async add(id: number, params: MyInput): Promise<MyOutput> {
        console.log(`[Executing] add for task ${id}`);
        return {
            c: params.a + params.b
        };
    }

    @CamundaConnector({ name: "math", operation: "sub" })
    public async sub(id: number, params: MyInput): Promise<MyOutput> {
        console.log(`[Executing] sub for task ${id}`);
        return {
            c: params.a - params.b
        };
    }
}

createConnectorServer({
    port: 8080
});