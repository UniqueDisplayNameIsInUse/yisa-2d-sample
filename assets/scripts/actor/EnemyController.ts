import { _decorator, Component, math, v3 } from 'cc';
import { Actor } from './Actor';
import { bt } from '../bt/BehaviourTree';
import { Chase, EscapeDash, HasTarget, IsSkillValid, IsLowHp, IsInAttackRange, UseSkill, MoveToDest, Rage, SetMoveDest, IsUseSkill } from './ai/AI';
import { BlackboardKey } from './ai/BlackboardKey';
import { Idle } from './state/Idle';
import { StateDefine } from './StateDefine';
import { Run } from './state/Run';
import { Dash } from './state/Dash';
import { Die } from './state/Die';
import { skill } from './skills/Skill';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('EnemyController')
@requireComponent(Actor)
export class EnemyController extends Component {

    actor: Actor = null;

    ai: bt.BehaviourTree = null;

    attackRange: number = 50;

    start() {
        this.actor = this.node.getComponent(Actor);
        this.initSkills();
        this.createAI();
        this.initBlackboard();

        this.actor.stateMgr.registState(new Idle(StateDefine.Idle, this.actor));
        this.actor.stateMgr.registState(new Run(StateDefine.Run, this.actor));
        this.actor.stateMgr.registState(new Dash(StateDefine.Dash, this.actor));
        this.actor.stateMgr.registState(new Die(StateDefine.Die, this.actor));
        this.actor.stateMgr.startWith(StateDefine.Idle);        
    }    

    update(deltaTime: number) {
        if (1) {
            this.ai.update(deltaTime);
        }
    }

    initBlackboard() {
        this.ai.setData(BlackboardKey.Escaped, false);
        this.ai.setData(BlackboardKey.Actor, this.actor);
        this.ai.setData(BlackboardKey.AttackRange, this.attackRange);

        this.randomNextMoveDest();
    }

    randomNextMoveDest() {
        let moveDest = v3(math.randomRange(0, 800), math.randomRange(0, 400), 0);

        this.ai.setData(BlackboardKey.MoveDest, moveDest);
        this.ai.setData(BlackboardKey.MoveDestDuration, 3.0);
    }

    createAI() {
        this.ai = new bt.BehaviourTree();

        // root 
        let rootNode = new bt.Fallback();

        this.ai.root = rootNode;

        // rage sequence
        if (0) {
            let rageSeq = new bt.Sequence();
            rootNode.addChild(rageSeq);

            let condRange = new IsLowHp();
            rageSeq.addChild(condRange);

            let rage = new Rage();
            rageSeq.addChild(rage);
        }

        if (1) {
            // escape 
            let escapeSeq = new bt.Sequence();
            rootNode.addChild(escapeSeq);

            // has the escaped key?
            let invertHasEscapedKey = new bt.InvertResultDecorator();

            let hasEscapeKey = new bt.IsTrue();
            hasEscapeKey.key = BlackboardKey.Escaped;
            invertHasEscapedKey.child = hasEscapeKey;
            escapeSeq.addChild(invertHasEscapedKey);

            let lowHp = new IsLowHp();
            escapeSeq.addChild(lowHp);

            //TODO: add escape action
            let escape = new EscapeDash();
            escapeSeq.addChild(escape);
        }

        // chase and attack
        if (1) {
            // attack 
            let useSkillSeq = new bt.Sequence();
            rootNode.addChild(useSkillSeq);

            //let hasTarget = new HasTarget();
            //useSkillSeq.addChild(hasTarget);

            //let isInAttackRange = new IsInAttackRange();
            //useSkillSeq.addChild(isInAttackRange);

            let hasValidSkill = new IsSkillValid();
            useSkillSeq.addChild(hasValidSkill);

            let useSkill = new UseSkill();
            useSkillSeq.addChild(useSkill);

        }

        // Partrol .... move to dest position
        if (1) {

            let moveDestSeq = new bt.Sequence();

            let hasMoveDest = new bt.IsTrue();
            hasMoveDest.key = BlackboardKey.MoveDest;
            moveDestSeq.addChild(hasMoveDest);

            let moveDest = new MoveToDest();
            moveDestSeq.addChild(moveDest);

            rootNode.addChild(moveDestSeq);

        }

        //set move dest when skill 0 is invalid 
        if (1) {
            let setmoveDestSeq = new bt.Sequence();
            rootNode.addChild(setmoveDestSeq);

            let inv = new bt.InvertResultDecorator();
            let skill = new IsUseSkill();
            inv.child = skill;
            setmoveDestSeq.addChild(inv);

            let setmoveDest = new SetMoveDest();
            setmoveDestSeq.addChild(setmoveDest);
        }

        if (0) {
            // chase 
            let chaseSeq = new bt.Sequence();
            rootNode.addChild(chaseSeq);

            let hasTarget = new HasTarget();

            // has target ?
            chaseSeq.addChild(hasTarget);

            // is in attack range?
            let invInRange = new bt.InvertResultDecorator();
            let isInAttackRange = new IsInAttackRange();
            invInRange.child = isInAttackRange;
            chaseSeq.addChild(invInRange);

            // chase 
            let chase = new Chase();
            chaseSeq.addChild(chase);
        }

        // wait for nothing 

        let wait = new bt.Wait();
        wait.interval = 1.0;
        rootNode.addChild(wait);
    }

    initSkills() {
        let skills = this.actor.skillMgr.skills;

        let sk1 = new skill.RangeSkill(this.actor.skillMgr);
        sk1.define = {
            id: 1,
            type: skill.Type.Range,
            cooldown: 10,
            duration: 1.0,
            emitterPath: "Animaiton/Emitter4Dir",
            castBuff: [],
            hitBuff: [],
        }

        skills.push(sk1);
    }
}

