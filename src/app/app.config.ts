export enum Path {
    home = 'home',
    square = 'square',
    fact = 'fact',
    community = 'community',
    doc = 'doc',
    market = 'market',
    analyze = 'analyze',
    robot = 'robot',
    strategy = 'strategy',
    trustee = 'trustee',
    exchange = 'exchange',
    simulate = 'simulate',
    dashboard = 'dashboard',
    createRobot = 'create_robot',
    charge = 'charge',
    debug = 'debug',
    edit = 'edit',
    backtest = 'backtest',
    verify = 'verify',
    rent = 'rent',
}

export enum LocalStorageKey {
    username = 'username',
    token = 'missionId',
    refUrl = 'refUrl',
    refUser = 'refUser'
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
