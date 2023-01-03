import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

export interface VirtualInput {
    vertical?: number;
    horizontal?: number;
    angle?: number;
}