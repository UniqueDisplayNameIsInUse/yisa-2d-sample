import { _decorator, Component, director, EventKeyboard, Input, input, KeyCode, math, Node, v3, Vec3 } from 'cc';
import { Actor } from './Actor';
import { Idle } from './state/Idle';
import { Run } from './state/Run';
import { StateDefine } from './StateDefine';
import { Dash } from './state/Dash';
import { SimpleEmitter } from './projectile/SimpleEmitter';
import { VirtualInput } from '../inputs/VirtualInput';
import { AimDirection } from './AimDirection';
import { GameEvent } from '../event/GameEvent';
import { Die } from './state/Die';
const { ccclass, property, requireComponent } = _decorator;

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

    target: Actor = null;

    aimAt: Vec3 = v3();

    onLoad() {
        PlayerController.instance = this;
    }

    start() {
        this.actor = this.node.getComponent(Actor);
        this.actor.stateMgr.registState(new Idle(StateDefine.Idle, this.actor));
        this.actor.stateMgr.registState(new Run(StateDefine.Run, this.actor));        
        this.actor.stateMgr.registState(new Die(StateDefine.Die, this.actor));
        this.actor.stateMgr.startWith(StateDefine.Idle);
        //PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.All;
        this.projectileEmitter.actor = this.actor;

        director.on(GameEvent.OnFireButtonClicked, this.fire, this);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestory() {
        PlayerController.instance = null;
        director.off(GameEvent.OnFireButtonClicked, this.fire, this);

        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        if (this.actor.dead) {
            return;
        }

        let h = VirtualInput.horizontal;
        let v = VirtualInput.vertical;        
        this.actor.input.set(h, v);
        if (this.actor.input.length() > math.EPSILON) {
            this.actor.stateMgr.transit(StateDefine.Run);
        } else {
            this.actor.stateMgr.transit(StateDefine.Idle);
        }
    }

    fire(direction: AimDirection) {
        this.gun.setWorldRotationFromEuler(0, 0, direction as number);
        this.projectileEmitter.emit();
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                VirtualInput.vertical = 1;
                break;
            case KeyCode.KEY_S:
                VirtualInput.vertical = -1;
                break;
            case KeyCode.KEY_A:
                VirtualInput.horizontal = -1;
                break;
            case KeyCode.KEY_D:
                VirtualInput.horizontal = 1;
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                VirtualInput.vertical = 0;
                break;
            case KeyCode.KEY_S:
                VirtualInput.vertical = 0;
                break;
            case KeyCode.KEY_A:
                VirtualInput.horizontal = 0;
                break;
            case KeyCode.KEY_D:
                VirtualInput.horizontal = 0;
                break;
        }
    }

}


