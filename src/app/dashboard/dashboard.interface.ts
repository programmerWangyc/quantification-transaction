import { Observable } from 'rxjs/internal/Observable';

export interface DeactivateGuard {
    canDeactivate: Observable<boolean>;
    message: string;
}
