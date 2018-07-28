import { Component, OnInit } from '@angular/core';

export interface SundryType {
    label: string;
    url: string;
}

export interface Sundry {
    title: string;
    list: SundryType[];
}

export const list: Sundry[] = [
    {
        title: '产品',
        list: [
            { label: '计算', url: '' },
            { label: '存储', url: '' },
            { label: '网络', url: '' },
            { label: '大数据', url: '' },
            { label: '机器学习', url: '' },
            { label: '管理工具', url: '' },
            { label: '开发者工具', url: '' },
            { label: '身份验证与安全', url: '' },
            { label: '系统状态', url: '' },
        ],
    },
    {
        title: '了解详情',
        list: [
            { label: '使用 botVS 的好处', url: '' },
            { label: '定价', url: '' },
            { label: '文档', url: '' },
            { label: '教程', url: '' },
            { label: '培训', url: '' },
            { label: '解决方案', url: '' },
            { label: '安全与合规性', url: '' },
            { label: '合作伙伴', url: '' },
            { label: '客户', url: '' },
            { label: '支持', url: '' },
            { label: '招贤纳士', url: '' },
            { label: '新闻', url: '' },
        ],
    },
    {
        title: '互动',
        list: [
            { label: '免费试用注册', url: '' },
            { label: '博客', url: '' },
            { label: '社区', url: '' },
            { label: 'Google+', url: '' },
            { label: 'Twitter', url: '' },
            { label: 'LinkedIn', url: '' },
            { label: 'Stack Overflow', url: '' },
            { label: 'YouTube', url: '' },
            { label: '播客', url: '' },
            { label: '简报注册', url: '' },
            { label: '用户体验调查', url: '' },
        ],
    },
];

@Component({
    selector: 'app-sundry',
    templateUrl: './sundry.component.html',
    styleUrls: ['./sundry.component.scss'],
})
export class SundryComponent implements OnInit {

    list = list;

    rightList: SundryType[] = [
        { label: 'Android', url: '' },
        { label: 'Chrome', url: '' },
        { label: 'Firebase', url: '' },
        { label: 'Google Cloud Platform', url: '' },
        { label: '所有产品', url: '' },
    ];

    constructor() { }

    ngOnInit() {
    }

}
