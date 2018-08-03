export enum Language {
    JavaScript,
    Python,
    'C++',
}

/**
 * 密钥操作的适配器；
 */
export enum OpStrategyTokenTypeAdapter {
   GET,
   UPDATE,
   DELETE,
   ADD,
}

/**
 * 策略的可见性分类
 */
export enum StrategyVisibilityType {
    publicOrRentable = -2,
    visibleMySelf,
}
