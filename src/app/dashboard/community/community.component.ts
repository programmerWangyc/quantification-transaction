import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-community',
    templateUrl: './community.component.html',
    styleUrls: ['./community.component.scss']
})
export class CommunityComponent implements OnInit {

    constructor(
        private sanitizer: DomSanitizer,
    ) { }

    ngOnInit() {
    }

}
