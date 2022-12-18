export interface State {
    onEnter?(...args: any):void;
    onExit?(...args: any):void;
    onUpdate?(deltaTime: number):void;
    onDestory?():void;
}

