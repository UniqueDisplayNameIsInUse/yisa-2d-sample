import { CCInteger, Node, Prefab, _decorator } from "cc";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("EmitterBurst")
export class EmitterBurst {
    @property(CCInteger)
    count: number = 0;

    @property
    time: number = 0;

    @property
    useNode: boolean = false;

    @property({ type: [Node], visible: function (this: EmitterBurst) { return this.useNode; } })
    nodes: Node[] = [];
}