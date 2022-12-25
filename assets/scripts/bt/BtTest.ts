import { _decorator, Component, Node, Animation } from 'cc';
import { bt } from './BehaviourTree';
import { BtJsonCodec } from './BtCodec';
const { ccclass, property } = _decorator;

const PATROL_END: string = 'PATROL_END';
const REACH_PATROL_END: string = 'REACH_PATROL_END';
const ENTITY: string = 'ENTITY';
const TARGET: string = 'TARGET';

export class Patrol extends bt.Action {

    execute(dt: number, result: bt.ExecuteResult) {
        let entity = result.blackboard.get(ENTITY) as Node;
        let hasPatrol = result.blackboard.has(PATROL_END);
        if (!hasPatrol) {
            bt.markFail(result);
            return;
        }

        if (result.blackboard.get(REACH_PATROL_END)) {
            bt.markSuccess(result);
            return;
        }

        bt.markRunning(result);
    }
}

export class Attack extends bt.Action {
    execute(dt: number, result: bt.ExecuteResult) {
        let entity = result.blackboard.get(ENTITY) as Node;
        let anim = entity.getComponent(Animation);
        anim.crossFade("attack");
        bt.markRunning(result);
    }
}

export class HasTarget extends bt.Condition {
    isSatisfy(result: bt.ExecuteResult): boolean {
        return result.blackboard.has(TARGET);
    }
}

@ccclass('BtTest')
export class BtTest extends Component {

    behaviourTree: bt.BehaviourTree;

    codec: BtJsonCodec = new BtJsonCodec();

    start() {        
        this.newSeqTest();        
    }

    newSeqTest() {
        this.behaviourTree = new bt.BehaviourTree();

        let seq = new bt.Sequence();
        this.behaviourTree.root = seq;

        let hasTarget = new HasTarget();

        let invert = new bt.InvertResultDecorator();
        invert.child = hasTarget;
        seq.addChild(invert);

        let patrol = new Patrol();
        seq.addChild(patrol);

        this.behaviourTree.result.blackboard.add(ENTITY, null);
        this.behaviourTree.result.blackboard.add(TARGET, null);
    }

    update(deltaTime: number) {
        this.behaviourTree?.update(deltaTime);
    }
}