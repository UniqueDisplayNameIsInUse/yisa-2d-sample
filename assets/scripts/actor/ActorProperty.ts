import { skill } from "./skills/Skill";

export class ActorProperty {
    hp: number = 10;
    maxHp: number = 10;
    attack: number = 1;
    linearSpeed: number = 1.0;
    skills: Array<skill.ISkill> = [];
}