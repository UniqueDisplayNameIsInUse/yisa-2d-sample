import { _decorator, ccenum, CCFloat, CurveRange, NodeSpace } from "cc";
const { ccclass, property, requireComponent } = _decorator;

ccenum(NodeSpace);
@ccclass("Vec3OverTime")
export class Vec3OverTime {

    @property({serializable:true})
    enable: boolean = false;

    @property({ type: CurveRange })
    x: CurveRange = new CurveRange();
    @property({ type: CurveRange })
    y: CurveRange = new CurveRange();
    @property({ type: CurveRange })
    z: CurveRange = new CurveRange();

    @property({ type: NodeSpace })
    nodeSpace: NodeSpace = NodeSpace.LOCAL;
}