export enum Path {
    account = 'account',
    add = 'add',
    agent = 'agent',
    analyze = 'analyze',
    backtest = 'backtest',
    charge = 'charge',
    community = 'community',
    copy = 'copy',
    dashboard = 'dashboard',
    debug = 'debug',
    doc = 'doc',
    edit = 'edit',
    exchange = 'exchange',
    fact = 'fact',
    google = 'google',
    home = 'home',
    market = 'market',
    nickname = 'nickname',
    rent = 'rent',
    reset = 'reset',
    robot = 'robot',
    simulation = 'simulation',
    square = 'square',
    strategy = 'strategy',
    usergroup = 'usergroup',
    verify = 'verify',
    wechat = 'wechat',
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
    BUTTON_TYPE,
}

export enum BtCommentType {
    square = 'square',
    competition = 'Competition',
    live = 'live',
    robot = 'R_',
    strategy = 'S_',
}
