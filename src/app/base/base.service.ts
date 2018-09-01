import { Observable, of } from 'rxjs';
import { MonoTypeOperatorFunction, Observer } from 'rxjs/internal/types';
import { catchError, filter, switchMap, timeout } from 'rxjs/operators';
import { TableStatistics } from '../interfaces/app.interface';
import { MemoizedSelector, select, Store } from '@ngrx/store';
import { AppState } from '../store/index.reducer';

export type CompareFn<T> = (pre: T, cur: T) => boolean;

export function getTableStatistics(total: number, pageSize: number): TableStatistics {
    return {
        total,
        page: Math.ceil(total / pageSize),
    };
}

export class BaseService {

    /**
     * 统计表格数据
     */
    getTableStatistics = getTableStatistics;

    isTruth(predicate: any): boolean {
        return !!predicate;
    }

    selectTruth<T>(selector: MemoizedSelector<AppState, T>): (store: Store<AppState>) => Observable<T> {
        return (store: Store<AppState>) => store.pipe(
            select(selector),
            this.filterTruth()
        );
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

    /**
     * Custom operator
     */
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

