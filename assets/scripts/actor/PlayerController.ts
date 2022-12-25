import { _decorator, Component, Node, Input } from 'cc';
import { Actor } from './Actor';
import { Idle } from './state/Idle';
import { Run } from './state/Run';
import { StateDefine } from './StateDefine';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('PlayerController')
@requireComponent(Actor)
export class PlayerController extends Component {

    actor: Actor | null = null;
    start() {
        this.actor.animationStateMachine.regist(StateDefine.Idle, new Idle(this.actor.animation));
        this.actor.animationStateMachine.regist(StateDefine.Run, new Run(this.actor.animation));

        this.actor.animationStateMachine.transitTo(StateDefine.Idle);
    }

    update(deltaTime: number) {

    }

}

