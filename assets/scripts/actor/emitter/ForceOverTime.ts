import { _decorator, ccenum, CurveRange, NodeSpace } from "cc";
const { ccclass, property, requireComponent } = _decorator;

ccenum(NodeSpace);
@ccclass("ForceOverTime")
export class ForceOverTime {
    @property
    x: CurveRange = new CurveRange();
    @property
    y: CurveRange = new CurveRange();
    @property
    z: CurveRange = new CurveRange();

    @property({ type: NodeSpace })
    nodeSpace: NodeSpace = NodeSpace.LOCAL;
}