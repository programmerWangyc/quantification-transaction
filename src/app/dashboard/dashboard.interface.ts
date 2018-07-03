import { Observable } from 'rxjs/internal/Observable';

export interface StrategyDetailDeactivateGuard {
    canDeactivate: Observable<boolean>;
    message: string;
}
