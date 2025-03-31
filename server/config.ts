import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '443'),
    iotEndpoint: process.env.AWS_IOT_ENDPOINT!,
    mqttClientId: process.env.MQTT_CLIENT_ID!,
    topic: process.env.TOPIC || 'ovenTemp',
    iotSSL: {
        key: process.env.OVEN_KEY_PATH!,
        cert: process.env.OVEN_CERT_PATH!,
        ca: process.env.OVEN_CA_PATH!,
    },
    serverSSL: {
        key: process.env.SERVER_KEY_PATH!,
        cert: process.env.SERVER_CERT_PATH!,
    }
};
