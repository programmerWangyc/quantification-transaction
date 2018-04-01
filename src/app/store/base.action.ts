
export abstract class ApiAction {
    abstract isSingleParams: boolean;

    abstract command: string;

    abstract order: ArrayLike<string>;

    orderParams(params: { [key: string]: any }, defaultValue = ''): any[] {
        return this.isSingleParams ? Object.keys(params).map(key => params[key])
            : new Array(this.order.length).fill(defaultValue).map((value, index) => params[this.order[index]] || value);
    }
}