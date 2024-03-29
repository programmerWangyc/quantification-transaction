
export enum Path {
    account = 'account',
    add = 'add',
    agent = 'agent',
    auth = 'auth',
    backtest = 'backtest',
    charge = 'charge',
    code = 'code',
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
    key = 'key',
    login = 'login',
    message = 'message',
    nickname = 'nickname',
    rent = 'rent',
    reset = 'reset',
    robot = 'robot',
    signup = 'singup',
    simulation = 'simulation',
    square = 'square',
    strategy = 'strategy',
    usergroup = 'usergroup',
    verify = 'verify',
    warn = 'warn',
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

export enum LanguageMap {
    zh = 'SIMPLE_CHINESE',
    en = 'ENGLISH',
}
