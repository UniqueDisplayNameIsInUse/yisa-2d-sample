import { _decorator, Component, input, math, Node, Quat, quat, v2, v3, Vec2, Vec3 } from 'cc';
import { Actor } from './Actor';
import { Idle } from './state/Idle';
import { Run } from './state/Run';
import { StateDefine } from './StateDefine';
import { HardwareInputs } from '../inputs/HardwareInputs';
import { mathutil } from '../util/MathUtil';
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

    start() {
        this.actor = this.node.getComponent(Actor);
        this.actor.animationStateMachine.regist(StateDefine.Idle, new Idle(this.actor));
        this.actor.animationStateMachine.regist(StateDefine.Run, new Run(this.actor));

        this.actor.animationStateMachine.registTransition(StateDefine.Idle, StateDefine.Run, () => { return true; })
        this.actor.animationStateMachine.registTransition(StateDefine.Run, StateDefine.Idle, () => { return true; })

        this.actor.animationStateMachine.transitTo(StateDefine.Idle);
    }

    update(deltaTime: number) {
        let h = HardwareInputs.getValue("horizontal");
        let v = HardwareInputs.getValue("vertical");
        let run = Math.abs(h) > 0 || Math.abs(v) > 0;

        temp.set(h * this.actor.actorProperty.linearSpeed, v * this.actor.actorProperty.linearSpeed);
        this.actor.rigidbody.linearVelocity = temp;
        //console.log(h, v);

        if (run) {
            this.actor.animationStateMachine.transitTo(StateDefine.Run);
        } else {
            this.actor.animationStateMachine.transitTo(StateDefine.Idle);
        }

        // do rotate gun
        this.rotateGun();

        if (HardwareInputs.getKeyUp("fire")) {
            console.log('fire');
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


