import { skill } from "./skills/Skill";

export class ActorProperty {
    hp: number = 100;
    maxHp: number = 100;
    attack: number = 0;
    linearSpeed: number = 1.0;
    skills: Array<skill.ISkill> = [];
}