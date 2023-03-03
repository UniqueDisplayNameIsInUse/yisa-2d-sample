export interface IState<TKey> {
    id: TKey
    onEnter(): void;
    onExit(): void;
    update(deltaTime: number): void;
    onDestory(): void;
    canTransit(to: TKey): boolean;
}

export interface IMachine<TKey> {
    add(state: IState<TKey>);
    remove(name: TKey);
    update(dt: number);
}

export interface ITransitable<TKey> {
    transiteTo(name: TKey);
}

export class SubMachine<TKey> implements IMachine<TKey>, IState<TKey>, ITransitable<TKey> {
    id: TKey;
    states: Map<TKey, IState<TKey>> = new Map();
    currState: IState<TKey>;
    defaultState: TKey;

    add(state: IState<TKey>) {
        this.states.set(state.id, state);
    }

    remove(name: TKey) {
        this.states.delete(name);
    }

    transiteTo(name: TKey) {
        if (this.currState && !this.currState.canTransit(name)) {
            return;
        }
        this.currState?.onExit();
        this.currState = this.states.get(name);
        this.currState?.onEnter();
    }

    update(dt: number) {
        this.currState?.update(dt);
    }

    onEnter(): void {
        if (this.defaultState) {
            this.transiteTo(this.defaultState);
        }
    }

    onExit(): void {
        this.currState?.onExit();
    }

    onDestory(): void {
        this.currState = null;
        this.states.clear();
    }

    canTransit(to: TKey): boolean {
        return this.currState?.canTransit(to);
    }
}