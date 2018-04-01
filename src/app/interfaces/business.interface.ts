import { Subscription } from 'rxjs/Subscription';

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