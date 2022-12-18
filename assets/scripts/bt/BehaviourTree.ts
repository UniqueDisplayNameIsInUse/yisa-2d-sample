import { math } from "cc";

export namespace bt {

    /**
     * 执行结果
     */
    export enum ExecuteState {
        /**
         * 失败
         */
        Fail = 'fail',

        /**
         * 执行成功
         */
        Success = 'success',

        /**
         * 执行中
         */
        Running = 'running',

    }

    export function markFail(result: ExecuteResult) {
        result.executeState = ExecuteState.Fail;
    }

    export function markRunning(result: ExecuteResult, runningNode: BtNode) {
        result.executeState = ExecuteState.Running;
        result.runningNode = runningNode;
    }

    export function markSuccess(result: ExecuteResult) {
        result.executeState = ExecuteState.Success;
    }

    /**
     * 执行结果
     */
    export class ExecuteResult {
        executeState: ExecuteState = ExecuteState.Fail;
        runningNode: BtNode;
        globalBlackboard: Blackboard;
        personalBlackboard: Blackboard;
    }

    /**
     * 基础节点
     */
    export interface BtNode {
        execute(dt: number, result: ExecuteResult);
    }

    /**
     * 执行节点
     */
    export abstract class ExecutionNode implements BtNode {
        abstract execute(dt: number, result: ExecuteResult);
    }

    /**
     * 动作节点
     */
    export abstract class Action implements ExecutionNode {
        abstract execute(dt: number, result: ExecuteResult);
    }

    /**
     * 条件节点
     */
    export abstract class Condition implements ExecutionNode {
        abstract isSatisfy(result: ExecuteResult): boolean;
        execute(dt: number, result: ExecuteResult) {
            result.executeState = this.isSatisfy(result) ? ExecuteState.Success : ExecuteState.Fail;
        }
    }

    /**
     * 控制节点
     */
    export abstract class ControllNode implements BtNode {
        children: Array<BtNode> = [];
        abstract execute(dt: number, result: ExecuteResult)

        addChild(child: BtNode) {
            this.children.push(child);
        }
    }

    /**
     * Sequence
     * 所有执行完毕
     */
    export class Sequence extends ControllNode {
        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            for (let child of this.children) {
                child.execute(dt, result);
                if (result.executeState == ExecuteState.Fail || result.executeState == ExecuteState.Running) {
                    break;
                }
            }
            return result;
        }
    }

    /**
     * Fallback 
     * 任意一个子节点执行成功或者所有子节点都执行失败
     */
    export class Fallback extends ControllNode {
        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            for (let child of this.children) {
                child.execute(dt, result);
                if (result.executeState != ExecuteState.Fail) {
                    break;
                }
            }
            return result;
        }
    }

    /**
     * Parallel
     * 返回一定数量[0, children.length]成功的则成功
     */
    export class Parallel extends ControllNode {
        mustSuccessCount: number = 1;
        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            let successCount: number = 0;
            for (let child of this.children) {
                result = child.execute(dt, result);
                if (result.executeState == ExecuteState.Success) {
                    successCount++;
                }
            }

            if (successCount >= this.mustSuccessCount) {
                markSuccess(result);
            }
        }
    }

    /**
     * 装饰器
     */
    export abstract class Decorator extends ControllNode {

    }

    /**
     * 随机选择器
     */
    export class RandomSelector extends ControllNode {

        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            let selectedChild = this.children[math.randomRangeInt(0, this.children.length)];
            selectedChild.execute(dt, result);
        }
    }

    /**
     * 等待一定时间
     */
    export class Wait extends Action {

        interval: number = 0;
        waitDuration: number = 1;
        start: boolean = false;

        execute(dt: number, result: ExecuteResult) {
            markFail(result);

            if (!this.start) {
                this.start = true;
                this.interval = 0;
                console.log('start wait');
            }

            this.interval += dt;
            if (this.interval < this.waitDuration) {
                markRunning(result, this);
                return;
            }

            console.log('start waitOver');
            this.interval = 0;
            this.start = false;
            markSuccess(result);
        }
    }

    /**
     * AI 的黑板     
     */
    export class Blackboard {
        data: Map<string, any> = new Map();

        has(name: string): boolean {
            return this.data.has(name)
        }

        add(name: string, val: any) {
            this.data.set(name, val)
        }

        remove(name: string) {
            this.data.delete(name);
        }
    }

    /**
     * 行为树
     */
    export class BehaviourTree {

        root: BtNode
        result: ExecuteResult = new ExecuteResult();

        update(dt: number) {

            // if (this.result.runningNode) {
            //     this.result.runningNode.execute(dt, this.result);
            //     return;
            // }

            // if (this.result.executeState != ExecuteState.Running) {
            //     this.result.runningNode = null;
            // }

            this.root.execute(dt, this.result);
        }
    }
}