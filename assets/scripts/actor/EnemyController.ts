import { _decorator, Component, math, v3 } from 'cc';
import { Actor } from './Actor';
import { bt } from '../bt/BehaviourTree';
import { Chase, EscapeDash, HasTarget, IsLowHp, IsInAttackRange, MoveToDest, Emit, IsCooldown, SetMoveDest, StayIdle } from './ai/BehaviourTree';
import { BlackboardKey } from './ai/BlackboardKey';
import { Idle } from './state/Idle';
import { StateDefine } from './StateDefine';
import { Run } from './state/Run';
import { Dash } from './state/Dash';
import { Die } from './state/Die';
import { SimpleEmitter } from './projectile/SimpleEmitter';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('EnemyController')
@requireComponent(Actor)
export class EnemyController extends Component {

    actor: Actor = null;

    ai: bt.BehaviourTree = null;

    attackRange: number = 50;

    start() {
        this.actor = this.node.getComponent(Actor);
        this.createAI();
        this.initBlackboard();

        this.actor.stateMgr.registState(new Idle(StateDefine.Idle, this.actor));
        this.actor.stateMgr.registState(new Run(StateDefine.Run, this.actor));
        this.actor.stateMgr.registState(new Dash(StateDefine.Dash, this.actor));
        this.actor.stateMgr.registState(new Die(StateDefine.Die, this.actor));
        this.actor.stateMgr.startWith(StateDefine.Idle);
    }

    update(deltaTime: number) {
        if (1) {
            this.ai.update(deltaTime);
        }
    }

    initBlackboard() {
        this.ai.setData(BlackboardKey.Escaped, false);
        this.ai.setData(BlackboardKey.Actor, this.actor);
        this.ai.setData(BlackboardKey.AttackRange, this.attackRange);

        this.randomNextMoveDest();
    }

    randomNextMoveDest() {
        let moveDest = v3(math.randomRange(0, 800), math.randomRange(0, 400), 0);

        this.ai.setData(BlackboardKey.MoveDest, moveDest);
        this.ai.setData(BlackboardKey.MoveDestDuration, 3.0);
    }

    createAI() {
        this.ai = new bt.BehaviourTree();

        // root 
        let rootNode = new bt.Fallback();

        this.ai.root = rootNode;

        if (1) {
            // escape 
            let escapeSeq = new bt.Sequence();
            rootNode.addChild(escapeSeq);

            // has the escaped key?
            let invertHasEscapedKey = new bt.InvertResultDecorator();

            let hasEscapeKey = new bt.IsTrue();
            hasEscapeKey.key = BlackboardKey.Escaped;
            invertHasEscapedKey.child = hasEscapeKey;
            escapeSeq.addChild(invertHasEscapedKey);

            let lowHp = new IsLowHp();
            escapeSeq.addChild(lowHp);

            //TODO: add escape action
            let escape = new EscapeDash();
            escapeSeq.addChild(escape);
        }

        // Partrol .... move to dest position
        if (1) {
            let moveDestSeq = new bt.Sequence();

            let hasMoveDest = new bt.IsTrue();
            hasMoveDest.key = BlackboardKey.MoveDest;
            moveDestSeq.addChild(hasMoveDest);

            let moveDest = new MoveToDest();
            moveDestSeq.addChild(moveDest);

            rootNode.addChild(moveDestSeq);
        }

        if (1) {
            let emitSeq = new bt.Sequence();

            let simpleEmitter = this.node.getComponentInChildren(SimpleEmitter);
            let cooldown = new IsCooldown();
            cooldown.emitter = simpleEmitter;
            emitSeq.addChild(cooldown);

            let emit = new Emit();
            emit.emitter = simpleEmitter;
            emitSeq.addChild(emit);

            rootNode.addChild(emitSeq);
        }

        if (0) {
            // chase 
            let chaseSeq = new bt.Sequence();
            rootNode.addChild(chaseSeq);

            let hasTarget = new HasTarget();

            // has target ?
            chaseSeq.addChild(hasTarget);

            // is in attack range?
            let invInRange = new bt.InvertResultDecorator();
            let isInAttackRange = new IsInAttackRange();
            invInRange.child = isInAttackRange;
            chaseSeq.addChild(invInRange);

            // chase 
            let chase = new Chase();
            chaseSeq.addChild(chase);
        }

        // wait for nothing 
        let idleSeq = new bt.Sequence();
        rootNode.addChild(idleSeq);

        idleSeq.addChild(new StayIdle());
        let wait = new bt.Wait();
        wait.elapsed = 1.0;
        idleSeq.addChild(wait);
        idleSeq.addChild(new SetMoveDest());        
    }
}

