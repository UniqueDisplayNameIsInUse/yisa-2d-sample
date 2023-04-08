/**
 * Enemey AI blackboard keys defination.
 */
export enum BlackboardKey {

    // Actor
    Actor = 'actor',

    // Player controller
    Self = 'self',

    // Vec3 
    MoveDest = 'moveDest', 

    // number
    MoveDestDuration = 'moveDestDuration',

    // Node 
    Target = 'target',
    
    // PlayerController 
    TargetPlayer = 'targetPlayer',
    
    // Actor
    TargetActor = 'targetActor',

    // boolean
    Escaped = 'escaped',

    // number
    //AttackRange = 'attackRange',
}   