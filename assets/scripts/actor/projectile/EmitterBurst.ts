import { CCFloat, CCInteger, Node, Quat, Vec3, _decorator, ccenum, clamp, math } from "cc";
import { ProjectileEmitter } from "./ProjectileEmitter";
const { ccclass, property, requireComponent } = _decorator;

export enum BurstShape {
    Origin = 0,
    Prefabs,
    //Sprial
}
ccenum(BurstShape)

@ccclass("EmitterBurst")
export class EmitterBurst {
    @property(CCInteger)
    count: number = 0;

    @property
    time: number = 0;

    @property({ type: BurstShape })
    burstShape: BurstShape = BurstShape.Origin;

    // @property({ type: CCFloat, visible: function (this: EmitterBurst) { return this.burstShape == BurstShape.Sprial; } })
    // sprialMaxAngle: number = 360;

    // @property({ type: CCFloat, visible: function (this: EmitterBurst) { return this.burstShape == BurstShape.Sprial; } })
    // sprialLen: number = 1;

    @property({ type: [Node], visible: function (this: EmitterBurst) { return this.burstShape == BurstShape.Prefabs; } })
    nodes: Node[] = [];

    @property
    repeatCount: number = 0;

    @property
    repeatInteval: number = 0;

    _currentCount: number = 0;

    _curTime: number = 0;

    getBustTransform(node: Node, index: number, pos: Vec3, rot: Quat) {
        if (this.burstShape == BurstShape.Prefabs) {
            let n = this.nodes[clamp(index, 0, this.nodes.length - 1)];
            pos.set(n.worldPosition.x, n.worldPosition.y, n.worldPosition.z);
            rot.set(n.worldRotation.x, n.worldRotation.y, n.worldRotation.z, n.worldRotation.w);
        } else if (this.burstShape == BurstShape.Origin) {
            pos.set(node.worldPosition.x, node.worldPosition.y, node.worldPosition.z);
            rot.set(node.worldRotation.x, node.worldRotation.y, node.worldRotation.z, node.worldRotation.w);
        }
    }

    update(pj: ProjectileEmitter, dt: number) {
        if (this._currentCount == 0) {
            this._curTime = this.time;
            this._currentCount = this.repeatCount;
        }

        let prev = pj.currentTime - dt;
        if (this._curTime >= prev && this._curTime < pj.currentTime) {
            pj.internalBurst(this);
            this._curTime += this.repeatInteval;
            this._currentCount--;            
        }
    }

    reset() {
        this._currentCount = 0;
        this._curTime = 0;
    }
}
