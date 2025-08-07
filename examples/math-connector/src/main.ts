import './connectors.js'; 
import { createConnectorServer } from 'camunda-connector-ts';

createConnectorServer({
    port: 8080
});