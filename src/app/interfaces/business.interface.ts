import { Subscription } from 'rxjs/Subscription';

/**
 * 每个组件通常情况下都只一个subscription负责在组件销毁时清理相关订阅，这个subscription的实现有2种方式，
 * 1、使用Subscription 类的 add 方法将多个subscription组合起来，此时需要注意订阅的顺序，如果前面有类似于Observable.of()等发出过
 * 结束通知的流，那么添加在后面的订阅可能不会执行。
 * 2、将每一个subscription 都放置在一个数组中，组件销毁时遍历此数组依次销毁订阅。
 */
export abstract class BusinessComponent {

    abstract subscription$$: Subscription;

    abstract launch(option?: any): void;

    abstract initialModel(option?: any): void;

    abstract ngOnInit(): void;

    abstract ngOnDestroy(): void;
}

export interface Referrer {
   refUser: string;
   refUrl: string; 
}

export interface SignupFormModel {
    username: string;
    email: string;
    passwordInfo: {
        password: string;
        confirmPassword: string;
    }
}
