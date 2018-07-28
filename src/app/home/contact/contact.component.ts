import { Component, OnInit } from '@angular/core';

export interface Contact {
    title: string;
    desc: string;
    buttons: string[];
}

export const list: Contact[] = [
    { title: '关注 Google Cloud Platform', desc: '在您最爱的社交网络上关注我们，随时掌握 Google Cloud Platform 的最新动态。', buttons: ['', '', ''] },
    { title: 'Google Cloud Platform 博客', desc: '提供产品更新、客户案例，以及与 Google Cloud Platform 相关的技巧和提示。', buttons: [''] },
    { title: '注册以接收简报', desc: '最新的 Google Cloud Platform 资讯、产品更新、问卷调查、活动信息和特别优惠，全都直接寄到您的收件箱。', buttons: [''] }
];

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {

    list = list;

    constructor() { }

    ngOnInit() {
    }

}
