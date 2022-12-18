export namespace skill {

    type skillId = number | string;

    export class Skill {
        id: skillId;
    }

    export class SkillDefine {
        id: skillId;
    }

    export class Active extends Skill {

        passiveSkills: Array<Passive> = [];

        calculate() {

        }
    }

    export class Passive extends Skill {

    }

    export class Manager {


    }
}