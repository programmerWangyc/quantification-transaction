export enum ServerBacktestCode {
    SUCCESS,
    FAILED,
    ALREADY_EXIST,
    NOT_FOUND,
    NOT_FINISHED,
    SIG_ERROR,
}

export enum ServerBacktestTaskStatus {
    TESTING,
    COMPLETE,
    BREAK_OFF
}

export enum BacktestMilestone {
    BACKTEST_SYSTEM_LOADING,
    BACKTESTING,
    START_RECEIVE_LOG_AFTER_BACKTEST_COMPLETE
}
