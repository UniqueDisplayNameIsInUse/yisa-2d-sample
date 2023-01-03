import { _decorator, Animation, AnimCurve, CCFloat, Collider, Collider2D, Component, ConstantForce, CurveRange, Node, ObjectCurve, Quat, QuatCurve, RealCurve, RigidBody2D, tween, Tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Projectile')
export class Projectile extends Component {

    @property(CCFloat)
    spin: number = 0;    

    collider: Collider2D;

    rigidbody: RigidBody2D;

    spinTween: Tween<Node> | null = null;  

    start() {        

    }

    update(deltaTime: number) {

    }
}

