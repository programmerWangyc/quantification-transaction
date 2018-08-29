import { Observable, of } from 'rxjs';
import { MonoTypeOperatorFunction, Observer } from 'rxjs/internal/types';
import { catchError, filter, switchMap, timeout } from 'rxjs/operators';

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

    loadingTimeout<T>(callback: (value: any) => T, secondes = 5000): (source: Observable<T>) => Observable<T> {
        return function (source: Observable<T>) {
            return Observable.create((subscriber: Observer<T>) => {
                const subscription = source.pipe(
                    switchMap(state => state ? source.pipe(
                        timeout(secondes),
                        catchError(err => of(err))
                    ) : of(state)),
                ).subscribe(value => {
                    try {
                        subscriber.next(callback(value));
                    } catch (err) {
                        subscriber.error(err);
                    }
                },
                    err => subscriber.error(err),
                    () => subscriber.complete()
                );

                return subscription;
            });
        };
    }

    /**
     * 取出 Observable 中的结果;
     */
    protected unwrap<T>(obs: Observable<T>): T {
        let result = null;

        obs.subscribe(res => result = res);

        return result;
    }
}

