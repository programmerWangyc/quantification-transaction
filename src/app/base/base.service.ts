import { MonoTypeOperatorFunction } from 'rxjs/internal/types';
import { filter } from 'rxjs/operators';

export class BaseService {
    isTruth(predicate: any): boolean {
        return !!predicate;
    }

    filterTruth<T>(): MonoTypeOperatorFunction<T> {
        return filter(this.isTruth);
    }

    isFalse(predicate): boolean {
        return !this.isFalse(predicate);
    }

    concatArray<T>(acc: T[], cur: T[]): T[] {
        return [...acc, ...cur];
    }

    putInArray<T>(acc: T[], cur: T): T[] {
        return [...acc, cur];
    }
}
