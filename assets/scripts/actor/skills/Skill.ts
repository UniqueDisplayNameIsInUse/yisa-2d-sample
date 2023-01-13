import { buff } from "../../buff/Buff";
import { array } from "../../util/Array";
import { str } from "../../util/String";
import { Actor } from "../Actor";
import { SimpleEmitter } from "../projectile/SimpleEmitter";
import { timeUtl } from "../../util/Time";
import { assert } from "cc";

export namespace skill {

    export type SkillId = number | string;

    export interface ISkill {
        skillMgr: Manager;
        define: SkillDefine;
        time: number;
        castTime: number;
        isCoolingdown: boolean;
        onStart();
        onEnd();
        update(dt: number);
    }

    export enum Type {
        Melee,
        Range,
    }

    export interface SkillDefine {
        id: SkillId;
        type: Type;
        cooldown: number
        duration: number
        emitterPath: string;
        castBuff: Array<buff.BuffId>;
        hitBuff: Array<buff.BuffId>;
    }

    export class Manager {
        skills: Array<ISkill> = [];

        currSkill: ISkill = null;

        actor: Actor

        constructor(actor: Actor) {
            this.actor = actor;
        }

        use(slot: number) {
            if (this.currSkill) {
                console.warn("[skill.Manager] currskill is not finished", this.currSkill);
            }
            assert(array.isValidIndex(this.skills, slot));
            let skill = this.skills[slot];

            if (!skill.isCoolingdown) {
                return;
            }

            this.useSkill(skill);
        }

        useFirstValid() {
            for (let s of this.skills) {
                if (s.isCoolingdown) {
                    this.useSkill(s);
                    break;
                }
            }
        }

        private useSkill(skill: ISkill) {
            this.currSkill = skill;
            this.currSkill.onStart();
        }

        update(deltaTime: number) {
            this.currSkill?.update(deltaTime);
        }

        onSkillEnd(skill: ISkill) {
            if (skill == this.currSkill) {
                this.currSkill = null;
            }
        }

        hasValidSkill(): boolean {
            if (array.isNullOrEmpty(this.skills)) {
                return false;
            }

            for (let s of this.skills) {
                if (s.isCoolingdown) {
                    return true;
                }
            }
            return false;
        }

        isCoolingdown(index: number): boolean {
            return this.skills[index].isCoolingdown;
        }
    }

    export class RangeSkill implements ISkill {

        skillMgr: Manager;
        _define: SkillDefine;
        set define(sd: SkillDefine) {
            this._define = sd;

            if (this._define && !str.isNullOrEmpty(this._define.emitterPath)) {
                let en = this.skillMgr.actor.node.getChildByPath(this._define.emitterPath);
                this.emitter = en.getComponent(SimpleEmitter);
                this.emitter.skill = this;
                this.emitter.actor = this.skillMgr.actor;
            }
        }
        get define(): Readonly<SkillDefine> { return this._define; }
        emitter: SimpleEmitter;
        time: number = 0;
        castTime: number = 0;
        get isCoolingdown(): boolean {
            return timeUtl.timeSinceLevelStart() - this.castTime >= this.define.cooldown;
        }

        constructor(skillMgr: Manager) {
            this.skillMgr = skillMgr;
        }

        onStart() {
            assert(this.isCoolingdown);
            this.time = 0;
            this.castTime = timeUtl.timeSinceLevelStart();
            this.emitter.emit();
        }

        onEnd() {

        }

        update(dt: number) {
            this.time += dt;
            if (this.time > this.define.duration) {
                this.onEnd();
                this.skillMgr.onSkillEnd(this);
            }
        }
    }
}