import { Component, _decorator } from "cc";
import { bt } from "./BehaviourTree";
const { property, ccclass } = _decorator;

export namespace bttest {

    class NamedAction extends bt.Action {
        execute(dt: number, result: bt.ExecuteResult) {
            result.executeState = bt.ExecuteState.Success;
            console.log(this.name);
        }

        constructor(protected name: string) {
            super();
        }
    }

    class AlwaysTrue extends bt.Condition {
        isSatisfy(result: bt.ExecuteResult): boolean {
            return true;
        }
    }

    class AlwaysFalse extends bt.Condition {
        isSatisfy(result: bt.ExecuteResult): boolean {
            return false;
        }
    }

    class AccessBlackboardCondition extends bt.Condition {
        isSatisfy(result: bt.ExecuteResult): boolean {
            let b = result.personalBlackboard as SimpleBlackboard;
            return b.value;
        }
    }

    export class BT_Test {

        behaviourTree: bt.BehaviourTree = null;


        testSimpleAction(dt: number) {

            if (this.behaviourTree == null) {
                this.behaviourTree = new bt.BehaviourTree();
            }

            if (this.behaviourTree.root != null) {
                this.behaviourTree.update(dt);
                return;
            }

            let root = new bt.Fallback();

            let p = new bt.Sequence();
            root.addChild(p);

            //let ap = new AlwaysTrue();
            let ap = new AlwaysFalse();
            p.addChild(ap);
            let n = new NamedAction("patrol");
            p.addChild(n);


            let att = new bt.Sequence();
            root.addChild(att);

            let af = new AlwaysFalse();
            att.addChild(af);
            let at = new NamedAction('attack');
            att.addChild(at);

            let w = new bt.Wait();
            w.waitDuration = 3;
            root.addChild(w);

            this.behaviourTree.root = root;
        }
    }

    class SimpleBlackboard extends bt.Blackboard {
        value: boolean;
    }

    @ccclass("BTTestComponent")
    export class BTTestComponent extends Component {

        test: BT_Test = new BT_Test();

        update(dt: number) {
            //this.test.testAttack(dt);

            this.test.testSimpleAction(dt);
        }
    }    
}
