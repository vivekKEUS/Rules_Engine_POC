import moleculer from 'moleculer';
import { Middleware as channelsmiddleware } from "@moleculer/channels";

interface ichannelsmiddleware {
    natsurl?: string; // optional property
    streamname?: string; // optional property
    subjects?: string[];
    sendmethodname?: string;
    debug?: boolean;
    namespace: string;
}
export const getchannelsmiddleware = ({
    natsurl = `nats://172.24.128.1:6969`,
    streamname = "kiotp-default",
    namespace,
    subjects = [`p1.>`, `p2.>`, `default.>`],
    sendmethodname = "sendToStream",
    debug = false,
}: ichannelsmiddleware): moleculer.Middleware =>{
    subjects = subjects.map(subject => `${namespace}.${subject}`);
    console.log("~~~~~~~~~~~~~subjects", subjects);
    //@ts-ignore
    return channelsmiddleware({
        // sendmethodname: "sendToStream",
        adapter: {
            type: "nats",
            //@ts-ignore
            options: {
                nats: {
                    url: "nats://172.24.128.1:6969",
                    connectionoptions: {
                    // token: "keus-iot-platform",
                    debug: debug
                    },
                    streamconfig: {
                        name: streamname,
                        subjects: subjects
                    },
                    consumeroptions: {
                        config: {
                            deliver_policy: "new",
                            ack_policy: "explicit",
                            max_ack_pending: 1
                        }
                    },
                    maxinflight: 10,
                    maxretries: 3,
                    deadlettering: {
                        enabled: false,
                        queuename: "dead_letter_reg"
                    }
                },
            }
        },
        context: true,
    })
}
