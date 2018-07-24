export enum Path {
    agent = 'agent',
    home = 'home',
    square = 'square',
    fact = 'fact',
    community = 'community',
    doc = 'doc',
    market = 'market',
    analyze = 'analyze',
    robot = 'robot',
    strategy = 'strategy',
    exchange = 'exchange',
    simulate = 'simulate',
    dashboard = 'dashboard',
    add = 'add',
    charge = 'charge',
    debug = 'debug',
    edit = 'edit',
    backtest = 'backtest',
    verify = 'verify',
    rent = 'rent',
    copy = 'copy',
}

export enum LocalStorageKey {
    username = 'username',
    token = 'missionId',
    refUrl = 'refUrl',
    refUser = 'refUser',
    editorConfig = 'editorConfig',
    backtestAdvancedOptions = 'backtestAdvancedOptions',
}

export enum VariableType {
    NUMBER_TYPE,
    BOOLEAN_TYPE,
    STRING_TYPE,
    SELECT_TYPE,
    ENCRYPT_STRING_TYPE,
    BUTTON_TYPE
}

/**
 * FIXME: unused
 */
export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'INFO'
}
