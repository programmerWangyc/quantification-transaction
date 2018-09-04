import { Path } from '../app.config';

export interface NavItem {
    icon?: string;
    label: string;
    path: string;
    selected?: boolean;
}

export interface SideNav extends NavItem {
    subNav?: NavItem[];
}

export const main: NavItem = {
    path: Path.home,
    label: 'HOME',
    icon: 'home',
};

export const square: SideNav = {
    path: Path.square,
    label: 'STRATEGY_SQUARE',
    icon: 'shopping-cart',
};

export const factFinder: SideNav = {
    path: Path.fact,
    label: 'FACT_FINDER',
    icon: 'line-chart',
};

export const community: SideNav = {
    path: Path.community,
    label: 'COMMUNITY',
    icon: 'eye',
};

export const documentation: SideNav = {
    path: Path.doc,
    label: 'API_DOCUMENTATION',
    icon: 'folder-open',
};

export const robot: SideNav = {
    path: Path.robot,
    label: 'ROBOT',
    icon: 'android',
};

export const strategy: SideNav = {
    path: Path.strategy,
    label: 'STRATEGY_LIBRARY',
    icon: 'chrome',
};

export const agent: SideNav = {
    path: Path.agent,
    label: 'AGENT',
    icon: 'apple',
};

export const exchange: SideNav = {
    path: Path.exchange,
    label: 'EXCHANGE',
    icon: 'windows',
};

export const charge: SideNav = {
    path: Path.charge,
    label: 'ACCOUNT_CHARGE',
    icon: 'pay-circle-o',
};

export const accountModules: NavItem[] = [
    { path: Path.account + '/' + Path.reset, label: 'MODIFY_PWD', icon: 'key' },
    { path: Path.account + '/' + Path.nickname, label: 'MODIFY_NICKNAME', icon: 'smile-o' },
    { path: Path.account + '/' + Path.wechat, label: 'BIND_WECHAT', icon: 'wechat' },
    { path: Path.account + '/' + Path.google, label: 'GOOGLE_VERIFY', icon: 'google' },
    { path: Path.account + '/' + Path.usergroup, label: 'SUBACCOUNT_GROUP', icon: 'usergroup-add' },
    { path: Path.account + '/' + Path.key, label: 'API_KEY', icon: 'key' },
    { path: Path.account + '/' + Path.warn, label: 'BALANCE_EARLY_WARNING', icon: 'bell' },
    { path: Path.account + '/' + Path.code, label: 'REGISTER_CODE', icon: 'tags-o' },
];

export const account: SideNav = {
    path: '',
    label: 'ACCOUNT_MANAGEMENT',
    icon: 'setting',
    subNav: accountModules,
};

/**
 * !TODO：应该有一个接口能获取到消息的状态，否则用户不点消息中心时是看不到有没有消息过来的。
 * !除非一进来就拉那3个message接口。
 */
export const message: SideNav = {
    path: Path.message,
    label: 'MESSAGE_CENTER',
    icon: 'bell',
};
/**
 * @deprecated 暂时不搞实盘仿真
 */
// const simulation: SideNav = {
//     label: 'FIRMWARE_SIMULATION',
//     path: Path.simulation,
//     icon: 'meh-o',
// };

export const quoteChart: NavItem = {
    path: 'https://quant.la/Tools/View/4/chart.html',
    label: 'QUOTE_CHART',
    icon: 'line-chart',
};

export const analyzing: NavItem = {
    path: 'https://quant.la/Tools/View/3/formula.html',
    label: 'ANALYZING_TOOL',
    icon: 'tool',
};
