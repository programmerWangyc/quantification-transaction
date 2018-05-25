export class BaseService {
    isTruth(predicate: any): boolean {
        return !!predicate;
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
