import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';

import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FileUploadModule } from 'ng2-file-upload';

import { ToolModule } from '../tool/tool.module';
import { AuthService } from './providers/auth.service';
import { WatchDogService } from './providers/watch-dog.service';

@NgModule({
    exports: [
        FlexLayoutModule,
        TranslateModule,
        NgZorroAntdModule,
        FormsModule,
        ReactiveFormsModule,
        FileUploadModule,
        CodemirrorModule,
        ToolModule,
    ],
})
export class SharedModule {
    static forRoot() {
        return {
            ngModule: SharedModule,
            providers: [AuthService, WatchDogService],
        };
    }
}
