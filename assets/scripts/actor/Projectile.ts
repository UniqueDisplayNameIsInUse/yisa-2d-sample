import { _decorator, Animation, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Projectile')
export class Projectile extends Component {
    
    start() {
        const animationComponent = this.node.getComponent(Animation);
        if (animationComponent && animationComponent.defaultClip) {
            const { defaultClip } = animationComponent;
            defaultClip.events.push({
                frame: 0.5, // 第 0.5 秒时触发事件
                func: 'onTriggered', // 事件触发时调用的函数名称
                params: [ '0' ], // 向 `func` 传递的参数
            });            
        }
    }

    update(deltaTime: number) {
        
    }
}

