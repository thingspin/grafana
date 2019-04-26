import mqtt from "mqtt";

export type TsMqttRecvMsgCallback = (topic: string, payload: string | object) => void;

export default class TsMqttController {
    readonly pubOpts: mqtt.IClientPublishOptions = {
        retain: true,
        qos: 0,
        dup: false,
    };
    client: mqtt.Client = null; // mqtt client instance

    callback: TsMqttRecvMsgCallback;

    constructor(private url: string, private topic: string) { }

    async run(callback?: TsMqttRecvMsgCallback): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.callback = callback;

            if (this.client) {
                // force disconnect
                this.client.end(true);
            }

            this.client = mqtt.connect(this.url)
                .subscribe(this.topic)
                .on("connect", () => resolve(true))
                .on("message", this.recvMqttMessage)
                .on("error", (err: any) => reject(err));
        });
    }

    async end() {
        return new Promise((resolve) => {
            this.client.end(true, () => {
                resolve(true);
                this.client = null;
            });
        });
    }

    onSubscribe(callback: TsMqttRecvMsgCallback): void {
        this.callback = callback;
    }

    publish(topic: string, message: string, opt: mqtt.IClientPublishOptions = this.pubOpts): Error {
        if (!this.client) {
            const message: string = "MQTT Client is not generated" as string;
            return new Error(message);
        }

        this.client.publish(topic, message, opt);
        return null;
    }

    private recvMqttMessage(topic: string, payload: Uint16Array): void {
        const str: string = payload.toString();

        let obj: string | object;
        try {
            // parse try
            obj = JSON.parse(str);
        } catch (e) {
            // is not json object
            obj = str;
        }

        if (this.callback) {
            this.callback(topic, obj);
        }
    }
}
