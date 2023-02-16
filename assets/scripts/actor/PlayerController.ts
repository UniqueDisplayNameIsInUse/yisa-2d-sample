import { _decorator, Component, math, Node, Quat, v2, v3, Vec2, Vec3 } from 'cc';
import { Actor } from './Actor';
import { Idle } from './state/Idle';
import { Run } from './state/Run';
import { StateDefine } from './StateDefine';
import { HardwareInputs } from '../inputs/HardwareInputs';
import { mathutil } from '../util/MathUtil';
import { Dash } from './state/Dash';
import { SimpleEmitter } from './projectile/SimpleEmitter';
const { ccclass, property, requireComponent } = _decorator;

let temp: Vec2 = v2(0, 0);
let tempV3: Vec3 = v3(0, 0, 0);
let tempQuat: Quat = new Quat();

@ccclass('PlayerController')
@requireComponent(Actor)
export class PlayerController extends Component {

    actor: Actor | null = null;

    @property(Node)
    aim: Node;

    @property(Node)
    gun: Node | null = null;

    @property(SimpleEmitter)
    projectileEmitter: SimpleEmitter;

    static instance: PlayerController | null = null;

    onLoad() {
        PlayerController.instance = this;
    }

    start() {
        this.actor = this.node.getComponent(Actor);
        this.actor.stateMgr.registState(new Idle(StateDefine.Idle, this.actor));
        this.actor.stateMgr.registState(new Run(StateDefine.Run, this.actor));
        this.actor.stateMgr.registState(new Dash(StateDefine.Dash, this.actor));
        this.actor.stateMgr.startWith(StateDefine.Idle);
        //PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.All;
        this.projectileEmitter.actor = this.actor;
    }

    onDestory() {
        PlayerController.instance = null;
    }

    update(deltaTime: number) {

        if (this.actor.dead) {
            return;
        }

        let h = HardwareInputs.getValue("horizontal");
        let v = HardwareInputs.getValue("vertical");
        this.actor.input.set(h, v);
        if (this.actor.input.length() > math.EPSILON) {
            this.actor.stateMgr.transit(StateDefine.Run);
        } else {
            this.actor.stateMgr.transit(StateDefine.Idle);
        }

        this.rotateGun();

        if (HardwareInputs.getKeyUp("fire")) {
            console.log('fire');
            this.projectileEmitter.emit();
        }

        if (HardwareInputs.getKeyDown("jump")) {
            console.log('jump');
            this.actor.stateMgr.transit(StateDefine.Dash);
        }
    }

    rotateGun() {
        let ms = HardwareInputs.mousePosition;
        Vec3.subtract(tempV3, ms, this.gun.worldPosition);
        let a = mathutil.signAngle(tempV3, Vec3.RIGHT, Vec3.FORWARD);
        Quat.fromEuler(tempQuat, 0, 0, math.toDegree(a));
        this.gun.setWorldRotation(tempQuat);
    }

}


