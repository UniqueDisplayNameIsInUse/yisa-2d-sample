import { Component, Vec3, _decorator } from "cc";
const { ccclass, property } = _decorator;

export abstract class CustomRigidbody extends Component {

    abstract applyForce(f: Vec3);

    abstract applyLocalForce(t: Vec3);

    abstract applyTorque(f: Vec3);

    abstract applyLocalTorque(t: Vec3);

    abstract setLinearVelocity(v: Vec3);

    abstract setAngularVelocity(v: Vec3);
}