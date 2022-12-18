import { Vec3, v3, Component, _decorator, geometry, PhysicsSystem, Node, assert, find, random, math, Camera, debug } from "cc";
import { mathu } from "../util/MathUtil";
import { phyutil } from "../util/PhyUtil";
import { bt } from "./BehaviourTree";
const { property, ccclass } = _decorator;

export namespace vbttest {
    export class PersonalBlackboard extends bt.Blackboard {
        startPosition: Vec3 = v3();
        patrolRadius: number = 10;
        patrolEnd: Vec3 = v3();
        target: Node = null;
        selfEntity: Node = null;
        eye: Node = null;
        speed: number = 3;
        attackRange: number = 1;
    }

    //#region Actions
    class Patrol extends bt.Action {

        execute(dt: number, result: bt.ExecuteResult) {
            result.executeState = bt.ExecuteState.Fail;

            assert(result.personalBlackboard instanceof PersonalBlackboard);
            let blackboard: PersonalBlackboard = result.personalBlackboard as PersonalBlackboard;

            let isReachLastPatrolEnd = Vec3.equals(blackboard.patrolEnd,
                blackboard.selfEntity.worldPosition,
                math.EPSILON);

            if (isReachLastPatrolEnd) {
                let radNormal = v3(random(), 0, random());
                radNormal.normalize();

                Vec3.scaleAndAdd(blackboard.patrolEnd, blackboard.startPosition,
                    radNormal, blackboard.patrolRadius);
                bt.markSuccess(result);
                console.log(blackboard.patrolEnd);
                return;
            }

            bt.markRunning(result, this);

            let dir = v3();
            Vec3.subtract(dir, blackboard.patrolEnd, blackboard.selfEntity.worldPosition);
            dir.normalize();
            let wp = v3();
            mathu.moveToward(wp, blackboard.selfEntity.worldPosition, blackboard.patrolEnd, dt * blackboard.speed);

            blackboard.selfEntity.worldPosition = wp;
        }
    }

    class ChaseTarget extends bt.Action{
        execute(dt: number, result: bt.ExecuteResult) {
            bt.markFail(result);

            assert(result.personalBlackboard instanceof PersonalBlackboard);
            let blackboard: PersonalBlackboard = result.personalBlackboard as PersonalBlackboard;

            if(blackboard.target == null){
                return;
            }
            let d = Vec3.distance(blackboard.target.worldPosition, blackboard.selfEntity.worldPosition);

            if( d < blackboard.attackRange ) {
                bt.markSuccess(result);
                return;
            }

            let wp = v3();
            mathu.moveToward(wp, blackboard.selfEntity.worldPosition, blackboard.target.worldPosition, dt * blackboard.speed);
            blackboard.selfEntity.worldPosition = wp;
        }
    }


    class SearchTarget extends bt.Action {

        execute(dt: number, result: bt.ExecuteResult) {
            bt.markFail(result);

            assert(result.personalBlackboard instanceof PersonalBlackboard);
            let blackboard: PersonalBlackboard = result.personalBlackboard as PersonalBlackboard;

            let node = find('Player');
            if (node != null) {
                blackboard.target = node;
                bt.markSuccess(result);
            }
        }
    }


    class Attack extends bt.Action {

        isAttack: boolean;
        attackAnimationLength: number = 3.0;
        startTime: number = 0;

        execute(dt: number, result: bt.ExecuteResult) {
            result.executeState = bt.ExecuteState.Fail;

            if (!this.isAttack) {
                this.isAttack = true;
                this.startTime = 0;
            }

            if (this.startTime >= this.attackAnimationLength) {
                result.executeState = bt.ExecuteState.Success;
                this.startTime = 0;
                console.log('attack success');
                return;
            }

            this.startTime += dt;
            result.executeState = bt.ExecuteState.Running;
            console.log('attack running')
        }
    }
    //#endregion

    //#region 

    // 找到目标
    class HasTarget extends bt.Condition {
        isSatisfy(result: bt.ExecuteResult): boolean {
            return (result.personalBlackboard as PersonalBlackboard).target != null;
        }
    }

    // 丢失目标
    class LostTarget extends bt.Condition{
        isSatisfy(result: bt.ExecuteResult): boolean {
            return (result.personalBlackboard as PersonalBlackboard).target == null;
        }
    }

    //#endregion

    @ccclass("VisualizeBTTest")
    export class VisualizeBTTest extends Component {

        testTree: bt.BehaviourTree = new bt.BehaviourTree();

        @property(Node)
        target: Node

        debugCamera: Camera;

        start() {
            let blackboard = new PersonalBlackboard();
            blackboard.selfEntity = this.target;
            blackboard.startPosition = this.node.worldPosition.clone();

            this.testTree.result.personalBlackboard = blackboard;
            let root = new bt.Fallback();;
            this.testTree.root = root;

            let patrol = new bt.Sequence();
            root.addChild(patrol);

            let noTarget = new LostTarget();
            patrol.addChild(noTarget);
            patrol.addChild(new Patrol());

            let wait = new bt.Wait()
            wait.waitDuration = 3;
            patrol.addChild(wait);

            // let chase = new bt.Sequence();

            // let hast = new HasTarget();
            // chase.addChild(hast);

            // let c = new ChaseTarget();
            // chase.addChild(c);

        }

        update(dt: number) {
            this.testTree.update(dt);
        }        
    }
}