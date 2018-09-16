import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-share',
    templateUrl: './share.component.html',
    styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {

    /**
     * topic
     */
    @Input() topic = '';

    @Input() pictures: string[] = [];

    /**
     * @ignore
     */
    @Input() wechat: string = location.href;

    /**
     * @ignore
     */
    @Input() direction = 'row';

    /**
     * @ignore
     */
    weibo: string;

    /**
     * @ignore
     */
    qZone: string;

    /**
     * @ignore
     */
    WEI_BO = 'http://v.t.sina.com.cn/share/share.php?title=';

    /**
     * @ignore
     */
    Q_ZONE = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=';

    /**
     * @ignore
     */
    mainPicture = 'https://www.botvs.com/images/square.png';

    constructor(
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        const url = encodeURI(location.href);

        const title = encodeURI(this.topic + ' - BotVS');

        const pictures = [this.mainPicture, ...this.pictures].map(src => encodeURIComponent(src));

        const mainPicture = this.pictures.length > 0 ? encodeURIComponent(this.pictures[0]) : encodeURI(this.mainPicture);

        const summary = encodeURIComponent(this.topic);

        this.weibo = `${this.WEI_BO}${title}&url=${url}&sourceUrl=${url}&pic=${mainPicture}`;

        this.qZone = `${this.Q_ZONE}${url}&title=${title}&pics=${pictures.join('|')}&summary=${summary}`;
    }

}
