import { Component, OnInit } from '@angular/core';

export interface ProductUser {
    logo: string;
    desc: string;
}

export const users: ProductUser[] = [
    { logo: '../../../assets/logo的副本/large/alcurex.png', desc: '' },
    { logo: '../../../assets/logo的副本/large/alcurex.png', desc: '' },
    { logo: '../../../assets/logo的副本/large/alcurex.png', desc: '“如果没有 Google Cloud Platform，我们绝不可能如此迅速地发布产品。这种先发优势非常宝贵。”' },
    { logo: '../../../assets/logo的副本/large/alcurex.png', desc: '“Snapchat 需要处理敏感的用户数据，因此使用 Google Cloud Platform 来存储。我们信任这项服务。”' },
    { logo: '../../../assets/logo的副本/large/alcurex.png', desc: '“Google 在 Cloud Platform 中提供的便利性、集成环境和可扩展性，让我们能提供最佳的在线日用品购物体验。”' },
    { logo: '../../../assets/logo的副本/large/alcurex.png', desc: '“使用 Google Cloud Platform 后，在两周时间里我们就开发出了能够进行集成测试的、运作良好的系统。”' },
];

@Component({
    selector: 'app-produce-users',
    templateUrl: './produce-users.component.html',
    styleUrls: ['./produce-users.component.scss'],
})
export class ProduceUsersComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}
