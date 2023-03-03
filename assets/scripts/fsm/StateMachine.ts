import { _decorator } from 'cc';
import { IState, SubMachine } from './State';

export class StateMachine<TKey> {

    mainMachine: SubMachine<TKey> = new SubMachine();

    get currState(): IState<TKey> {
        return this.mainMachine.currState;
    }

    startWith(name: TKey) {
        this.mainMachine.defaultState = name;
        this.mainMachine.transiteTo(name);
    }

    registState(state: IState<TKey>) {
        this.mainMachine.add(state);
    }

    deregistState(name: TKey) {
        this.mainMachine.remove(name);
    }

    transit(name: TKey) {
        this.mainMachine.transiteTo(name);
    }

    update(dt: number) {
        this.mainMachine.update(dt);
    }

}

