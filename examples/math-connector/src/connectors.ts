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
    public async getUserProfile(id: number, params: MyInput): Promise<MyOutput> {
        console.log(`[Executing] add for task ${id}`);
        return {
            c: params.a + params.b
        };
    }
}