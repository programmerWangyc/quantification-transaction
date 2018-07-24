import { NavigationExtras } from '@angular/router';

// ==========================================================Global========================================

/**
 * 各业务页面的面包屑
 */
export interface Breadcrumb {
    name: string;
    path?: string;
}

export interface RouterInfo {
    path: any[];
    query?: object;
    extras?: NavigationExtras;
}

// ==========================================================Front end custom data structure========================================

export interface Referrer {
    refUser: string;
    refUrl: string;
}

export interface VariableTypeDes {
    id: number;
    name: string;
    inputType: string;
}

export interface VariableOverview {
    variableName: string;
    variableDes: string;
    variableComment: string; // 从页面上看貌似只能是这个
    variableValue: string | number | boolean;
    variableTypeId: number;
    originValue: string | number;
}

export interface TemplateVariableOverview {
    variables: VariableOverview[];
    id: number;
    name: string;
    category: number;
}

export interface SelectedPair {
    platformId: number | string;
    stock: string;
    platformName: string;
}

export interface ConfirmOperateTipData {
    message: string;
    needTranslate: boolean;
    confirmBtnText?: string;
}

export interface StrategyChartPoint {
    id: string;
    x?: number;
    y?: number;
    high?: number;
    low?: number;
    open?: number;
    close?: number;
    color?: string;
    shape?: string;
    text?: string;
    title?: string;
    seriesIdx?: number;
}

export interface StrategyChartData {
    seriesIdx: number;
    data: StrategyChartPoint[];
}

export interface ChartUpdateIndicator {
    updated: boolean;
    chartIndex: number;
    feedback: string;
}

export interface EditorConfig {
    [key: string]: string | number | boolean;
}

export interface ChartSize {
    charts: Highcharts.ChartObject[] | Highcharts.ChartObject;
    height: number;
    width: number;
}
