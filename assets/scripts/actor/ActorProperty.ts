import { skill } from "./Skill";

export class ActorProperty {
    hp: number = 0;
    maxHp: number = 0;


    linearSpeed: number = 3.0;
    
    skills: Array<skill.Skill> = [];
}