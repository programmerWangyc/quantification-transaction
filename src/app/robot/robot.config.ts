
export enum CommandRobotTip {
    invalidRobotState = 'COMMAND_ROBOT_STATE_ERROR_TIP',
    invalidNumberTypeArg = 'COMMAND_ROBOT_NUMBER_TYPE_ARG_ERROR_TIP',
    invalidStringTypeArg = 'COMMAND_ROBOT_EMPTY_STRING_ARG_ERROR_TIP',
    invalidCommandLength = 'COMMAND_ROBOT_LENGTH_ERROR_TIP'
}

export enum LogTypes {
    BUY,
    SALE,
    RETRACT,
    ERROR,
    PROFIT,
    MESSAGE,
    RESTART
}

export enum ServerSendRobotEventType {
    UPDATE_STATUS = 1 << 0, // 状态栏
    UPDATE_PROFIT = 1 << 1, //
    UPDATE_SUMMARY = 1 << 2, //
    UPDATE_PUSH = 1 << 3, // none used
    UPDATE_REFRESH = 1 << 4, // 日志
    UPDATE_DEBUG = 1 << 5 //
}

export enum StrategyChartSeriesData {
    X,
    OPEN,
    HIGH,
    LOW,
    CLOSE
}

export enum SemanticsLog {
    runningLog = 'runningLog',
    profitLog = 'profitLog',
    strategyLog = 'strategyLog'
}
