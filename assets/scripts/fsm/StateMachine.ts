import { _decorator } from 'cc';
import { State } from './State';
import { OnCanTransit as CanTransitCallback, Transition } from './Transition';

type TransitionMap<TKey> = Map<TKey, Transition<TKey>>;
type Transtions<TKey> = Map<TKey, TransitionMap<TKey>>;

export class StateMachine<TKey>{

    states: Map<TKey, State> = new Map();

    private _curStateKey: TKey | null = null;

    private _allowSameTransit: boolean = false;

    private transitions: Transtions<TKey> = new Map();

    openLog: boolean = false;

    regist(key: TKey, state: State) {
        this.states.set(key, state);
    }

    deregister(key: TKey, clearTransition: boolean = true) {
        this.states.delete(key);
        if (clearTransition) {
            this.deregistTransition(key);
        }
    }

    transitTo(key: TKey, ...arg: any) {
        if (key == this._curStateKey) {
            if (!this._allowSameTransit) {
                return;
            }
        }

        if (this._curStateKey != null) {
            if (!this.canTransitTo(this._curStateKey, key)) {
                this.w("transit from: [", this._curStateKey, "] to [", key, "] is not allowed");
                return;
            }
            let currState = this.states.get(this._curStateKey);
            currState.onExit(...arg);
        }

        this._curStateKey = key;
        this.l("transite:[", key, "] success.");
        let newState = this.states.get(key);
        newState.onEnter(...arg);
    }

    onUpdate(deltaTime: number) {
        let currState = this.states.get(this._curStateKey);
        currState?.onUpdate(deltaTime);
    }

    canTransitTo(from: TKey, to: TKey): boolean {
        if (!this.transitions.has(from)) {
            return false;
        }

        let tm = this.transitions.get(from);
        if (!tm.has(to)) {
            return false;
        }

        const callback = tm.get(to);
        return callback.canTransit(this, from, to);
    }

    clearAllStates() {
        for (const value of this.states.values()) {
            value.onDestory();
        }
        this.states.clear();
    }

    destory() {
        this.clearAllStates();
        this.transitions.clear();
    }

    registTransition(from: TKey, to: TKey, canTransite: CanTransitCallback<TKey>) {
        let tm: TransitionMap<TKey> = null;
        if (!this.transitions.has(from)) {
            tm = new Map();
            this.transitions.set(from, tm);
        } else {
            tm = this.transitions.get(from);
        }

        tm.set(to, new Transition(from, to, canTransite));
    }

    deregistTransition(from: TKey, to: TKey | null = null) {
        if (to == null) {
            this.transitions.delete(from);
        } else {
            this.transitions.get(from).delete(to);
        }
    }

    protected l(...arg: any) {
        if (this.openLog) {
            console.log(...arg);
        }
    }

    protected w(...arg: any) {
        if (this.openLog) {
            console.warn(...arg);
        }
    }

    protected e(...arg: any) {
        if (this.openLog) {
            console.error(...arg);
        }
    }
}

