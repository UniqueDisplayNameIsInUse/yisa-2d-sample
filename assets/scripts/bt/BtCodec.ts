import { bt } from "./BehaviourTree";

export interface BtCodec<TContext> {
    decode(context: TContext): bt.BehaviourTree;
    encode(context: bt.BehaviourTree): string
}

export class BtJsonCodec implements BtCodec<string> {

    decode(context: string): bt.BehaviourTree {
        return JSON.parse(context, receiver);
    }

    encode(context: bt.BehaviourTree): string {
        return JSON.stringify(context, replacer);
    }
}

function receiver(key: string, value: any) {
       
}

function replacer(key: string, value: any) {
    console.log('replacer', "|", key, "|", value)

    if (value == null || value == undefined) {
        return value;
    }

    if (value instanceof bt.Action) {
        console.log('action:', value);
    }

    if (value instanceof Map) {
        let map = {}
        for (let k of value.keys()) {
            map[k] = null;
        }
        return JSON.stringify(map);
    }

    if (value instanceof Array) {       
        console.log("Array", value);
    }

    return value;

}