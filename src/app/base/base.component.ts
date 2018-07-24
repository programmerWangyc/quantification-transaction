import { ElementRef, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';

import { SelectedPair } from '../interfaces/app.interface';
import { Platform } from '../interfaces/response.interface';

/**
 * 每个组件通常情况下都只有一个subscription负责在组件销毁时清理相关订阅，这个subscription的实现有2种方式，
 * 1、使用Subscription 类的 add 方法将多个subscription组合起来，此时需要注意订阅的顺序，如果前面有类似于Observable.of()等发出过
 * 结束通知的流，那么添加在后面的订阅可能不会执行。
 * 2、将每一个subscription 都放置在一个数组中，组件销毁时遍历此数组依次销毁订阅。
 */
export abstract class BaseComponent {

    abstract subscription$$: Subscription;

    abstract launch(option?: any): void;

    abstract initialModel(option?: any): void;

    abstract ngOnInit(): void;

    abstract ngOnDestroy(): void;
}

function toggle() {
    this.isFold = !this.isFold;

    const ele: HTMLElement = this.eleRef.nativeElement.querySelector('.ant-card-body');

    if (this.isFold) {
        this.render.setStyle(ele, 'display', 'none');
    } else {
        this.render.removeStyle(ele, 'display');
    }
}

export abstract class FoldableBusinessComponent {
    abstract isFold: boolean;

    constructor(public render: Renderer2, public eleRef: ElementRef) { }

    toggle = toggle;
}

export abstract class ExchangePairBusinessComponent extends FoldableBusinessComponent {
    abstract selectedPairs: SelectedPair[];

    abstract platforms: Platform[];

    constructor(public render: Renderer2, public eleRef: ElementRef) { super(render, eleRef) }

    addPair(platformId: number, stock: string) {
        if (!platformId || !stock) return;

        const { name } = this.platforms.find(item => item.id === platformId);

        if (!this.selectedPairs.find(item => item.platformId === platformId && item.stock === stock)) {
            this.selectedPairs.push({ platformId, stock, platformName: name });
        } else {
            /**
             * do nothing;
             */
        }
    }

    removePair(index: number) {
        this.selectedPairs.splice(index, 1);
    }

    toggle = toggle;
}
