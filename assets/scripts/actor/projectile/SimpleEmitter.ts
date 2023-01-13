import { CCFloat, Component, Node, Prefab, RigidBody2D, Vec2, Vec3, _decorator, instantiate, v2, v3 } from "cc";
import { sceneUtil } from "../../util/SceneUtil";
import { skill } from "../skills/Skill";
import { Projectile } from "./Projectile";
import { Actor } from "../Actor";
const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

@ccclass('SimpleEmitter')
export class SimpleEmitter extends Component {

    @property(Node)
    emitterRoot: Node | null = null;

    @property(Prefab)
    projectilePrefab: Prefab | null = null;

    @property(CCFloat)
    startLinearSpeed: number = 0;

    @property(CCFloat)
    startAngularVelocity: number = 20;

    skill: skill.ISkill | null = null;
    
    actor:Actor = null;

    start() {
    }

    emit() {
        for (let i = 0; i < this.emitterRoot.children.length; i++) {
            let emitNode = this.emitterRoot.children[i];
            if (!emitNode.active) {
                continue;
            }
            let wr = emitNode.worldRotation;
            let node = instantiate(this.projectilePrefab);

            sceneUtil.gameCanvas().addChild(node);

            let left = Vec3.UNIT_X;
            let velocityV3 = v3();
            Vec3.transformQuat(velocityV3, left, wr);

            let rigid = node.getComponent(RigidBody2D);
            let velocity: Vec2 = v2();
            velocity.x = velocityV3.x;
            velocity.y = velocityV3.y;
            velocity.multiplyScalar(this.startLinearSpeed);

            rigid.linearVelocity = velocity;
            rigid.angularVelocity = this.startAngularVelocity;

            node.worldPosition = emitNode.worldPosition;

            let projectile = node.getComponent(Projectile);
            projectile.host = this.actor;
        }
    }
}