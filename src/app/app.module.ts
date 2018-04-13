import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { MatSnackBarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { HomeModule } from './home/home.module';
import { FooterComponent } from './layout/footer/footer.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { GLOBAL_SERVICES } from './providers/service.import';
import { SharedModule } from './shared/shared.module';
import { EFFECTS } from './store/index.effect';
import { reducers } from './store/index.reducer';
import { ToolModule } from './tool/tool.module';


// Use AoT, so we need a exported factory function for compiler.
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        FooterComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        HttpModule,
        HomeModule,
        AppRoutingModule, // top level route, must at last of all routers;
        SharedModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        StoreModule.forRoot(reducers),
        StoreDevtoolsModule.instrument({
            maxAge: 20
        }),
        EffectsModule.forRoot(EFFECTS),
        MatSnackBarModule,
        ToolModule,
        NgZorroAntdModule.forRoot(),
    ],
    providers: [
        Store,
        GLOBAL_SERVICES,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
