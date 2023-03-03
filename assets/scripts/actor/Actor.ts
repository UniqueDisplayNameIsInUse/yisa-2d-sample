import { _decorator, Component, RigidBody2D, CircleCollider2D, Animation, Collider2D, Sprite, Vec2, v2, math, Vec3, Color, Quat, CCFloat, Contact2DType, IPhysics2DContact, v3, director } from 'cc';
import { StateMachine } from '../fsm/StateMachine';
import { StateDefine } from './StateDefine';
import { mathutil } from '../util/MathUtil';
import { colliderTag } from './ColliderTags';
import { Projectile } from './projectile/Projectile';
import { GameEvent } from '../event/GameEvent';
const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

@ccclass('Actor')
@requireComponent(RigidBody2D)
@requireComponent(CircleCollider2D)
@disallowMultiple(true)
export class Actor extends Component {

    rigidbody: RigidBody2D | null = null;

    collider: Collider2D | null = null;

    stateMgr: StateMachine<StateDefine> = new StateMachine();

    @property(Animation)
    animation: Animation = null;

    hp: number = 100;
    maxHp: number = 100;
    attack: number = 10;
    linearSpeed: number = 3;

    @property(Sprite)
    mainRenderer: Sprite

    _input: Vec2 = v2();
    set input(v: Vec2) { this._input.set(v.x, v.y); }
    get input(): Vec2 { return this._input; }

    dead: boolean = false;

    @property(CCFloat)
    linsearSpeed: number = 1;

    start() {
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(Collider2D);

        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onProjectileTriggerEnter, this);
    }

    onDestroy() {
    }

    update(deltaTime: number) {
        this.stateMgr.update(deltaTime);

        if (this.input.x < 0) {
            this.mainRenderer.node.rotation = mathutil.ROT_Y_180;
        } else if (this.input.x > 0) {
            this.mainRenderer.node.rotation = Quat.IDENTITY;
        }
    }

    onProjectileTriggerEnter(ca: Collider2D, cb: Collider2D, contact: IPhysics2DContact) {
        if (colliderTag.isProjectileHitable(cb.tag, ca.tag)) {
            //console.log('project tigger enter', contact);
            let hurtSrc = cb.node.getComponent(Projectile).host;
            let hitNormal = v3();
            Vec2.subtract(hitNormal, ca.node.worldPosition, cb.node.worldPosition);
            hitNormal.normalize();
            const v2Normal = v2(hitNormal.x, hitNormal.y);
            this.onHurt(this.attack, hurtSrc, v2Normal);
        }
    }

    onHurt(damage: number, from: Actor, hurtDirection?: Vec2) {
        this.hp = Math.floor(math.clamp(this.hp - damage, 0, this.maxHp));

        this.mainRenderer.color = Color.RED;
        this.scheduleOnce(() => {
            this.mainRenderer.color = Color.WHITE;
        }, 0.2);

        if (this.hp <= 0) {
            this.stateMgr.transit(StateDefine.Die);
        }
    }
}

