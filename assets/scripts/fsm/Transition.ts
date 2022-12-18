import { StateMachine } from "./StateMachine";

export type OnCanTransit<TKey> = (sm: StateMachine<TKey>, from: TKey, to: TKey) => boolean;

export class Transition<TKey>{
    constructor(public from: TKey, public to: TKey, public canTransit: OnCanTransit<TKey>) {
    }
}