import { ElementRef, Renderer2 } from '@angular/core';

import { SelectedPair } from '../interfaces/app.interface';
import { Platform } from '../interfaces/response.interface';

export abstract class BaseComponent {

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

    toggle = toggle;

    constructor(public render: Renderer2, public eleRef: ElementRef) { super(render, eleRef); }

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
}
