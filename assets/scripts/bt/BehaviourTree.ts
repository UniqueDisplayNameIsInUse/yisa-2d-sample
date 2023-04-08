import { math } from "cc";

/**
 * 行为树
 */
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

    /**
   * AI 的黑板     
   */
    export interface Blackboard {
        has(name: string): boolean;
        set(name: string, val: any);
        get(name: string): any;
        delete(name: string);
    }

    export function markFail(result: ExecuteResult) {
        result.executeState = ExecuteState.Fail;
    }

    export function markRunning(result: ExecuteResult) {
        result.executeState = ExecuteState.Running;
    }

    export function markSuccess(result: ExecuteResult) {
        result.executeState = ExecuteState.Success;
    }

    /**
     * 执行结果
     */
    export class ExecuteResult {
        executeState: ExecuteState = ExecuteState.Fail;
        blackboard: Blackboard = new Map();
    }

    /**
     * 基础节点
     */
    export interface BtNode {
        execute(dt: number, result: ExecuteResult);
    }
   
    /**
     * 动作节点
     */
    export abstract class Action implements BtNode {
        abstract execute(dt: number, result: ExecuteResult);
    }

    /**
     * 条件节点
     */
    export abstract class Condition implements BtNode {
        abstract isSatisfy(result: ExecuteResult): boolean;
        execute(dt: number, result: ExecuteResult) {
            result.executeState = this.isSatisfy(result) ? ExecuteState.Success : ExecuteState.Fail;
        }
    }

    /**
     * 控制节点
     */
    export abstract class ControlNode implements BtNode {
        children: Array<BtNode> = [];
        abstract execute(dt: number, result: ExecuteResult);
        addChild(child: BtNode) {
            this.children.push(child);
        }
    }

    /**
     * Sequence
     * 所有执行完毕
     */
    export class Sequence extends ControlNode {
        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            for (let child of this.children) {
                child.execute(dt, result);
                if (result.executeState == ExecuteState.Fail || result.executeState == ExecuteState.Running) {
                    break;
                }
            }
        }
    }

    /**
     * Fallback 
     * 任意一个子节点执行成功或者所有子节点都执行失败
     */
    export class Fallback extends ControlNode {
        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            for (let child of this.children) {
                child.execute(dt, result);
                if (result.executeState != ExecuteState.Fail) {
                    break;
                }
            }
        }
    }

    /**
     * Parallel
     * 返回一定数量[0, children.length]成功的则成功
     */
    export class Parallel extends ControlNode {
        mustSuccessCount: number = 1;
        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            let successCount: number = 0;
            for (let child of this.children) {
                child.execute(dt, result);
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
    export abstract class Decorator implements BtNode {
        child: BtNode = null;
        execute(dt: number, result: ExecuteResult) {
            this.child?.execute(dt, result);
            this.decroateResult(result);
        }
        abstract decroateResult(result: ExecuteResult);
    }

    /**
     * 随机选择器
     */
    export class RandomSelector extends ControlNode {
        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            let selectedChild = this.children[math.randomRangeInt(0, this.children.length)];
            selectedChild.execute(dt, result);
        }
    }

    /**
     * 翻转节点的结果
     */
    export class InvertResultDecorator extends Decorator {
        decroateResult(result: ExecuteResult) {
            if (result.executeState == ExecuteState.Fail) {
                result.executeState = ExecuteState.Success;
            } else if (result.executeState == ExecuteState.Success) {
                result.executeState = ExecuteState.Fail;
            }
        }
    }

    /**
     * 等待一定时间
     */
    export class Wait extends Action {

        elapsed: number = 0;
        interval: number = 1;
        start: boolean = false;

        execute(dt: number, result: ExecuteResult) {
            markFail(result);

            if (!this.start) {
                this.start = true;
                this.elapsed = 0;
            }

            this.elapsed += dt;
            if (this.elapsed < this.interval) {
                markRunning(result);
                return;
            }

            this.elapsed = 0;
            this.start = false;
            markSuccess(result);
        }
    }

    /**
     * check has key
     */
    export class ContainsKey extends Condition {
        isSatisfy(result: ExecuteResult): boolean {
            return result.blackboard.has(this.key);
        }
        key: string;
    }

    /**
     * check if the key is true
     */
    export class IsTrue extends Condition {
        isSatisfy(result: ExecuteResult): boolean {
            return result.blackboard.get(this.key);
        }
        key: string
    }


    /**
     * 行为树
     */
    export class BehaviourTree {

        root: BtNode
        result: ExecuteResult = new ExecuteResult();

        setData(name: string, value: any) {
            this.result.blackboard.set(name, value);
        }

        getData(name: string): any {
            return this.result.blackboard.get(name);
        }

        removeData(name: string) {
            this.result.blackboard.delete(name);
        }

        hasData(name: string): boolean {
            return this.result.blackboard.has(name);
        }

        update(dt: number) {
            this.root?.execute(dt, this.result);
        }
    }
}