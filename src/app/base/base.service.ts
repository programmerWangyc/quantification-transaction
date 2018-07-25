import { MonoTypeOperatorFunction } from 'rxjs/internal/types';
import { filter, tap } from 'rxjs/operators';

export type CompareFn<T> = (pre: T, cur: T) => boolean;

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

    print<T>(): MonoTypeOperatorFunction<T> {
        return tap(v => console.log(v));
    }

    compareAllValues<T>(): CompareFn<T> {
        return (previous: T, current: T) => {
            return Object.keys(current).every(key => previous[key] === current[key]);
        };
    }

    curryRight(fn) {
        return param1 => fn(param1);
    }

    curry2Right<T, R>(fn: (f: T, s: R) => any) {
        return (param2: R) => {
            return (param1: T) => {
                return fn(param1, param2);
            };
        };
    }
}

