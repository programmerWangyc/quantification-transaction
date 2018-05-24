import { CategoryType, GetStrategyListRequest } from '../../interfaces/request.interface';
import { createScriptArgs } from '../robot/robot.reducer';
import { GetStrategyListResponse, Strategy } from './../../interfaces/response.interface';
import * as actions from './strategy.action';

export interface RequestParams {
    strategyList: GetStrategyListRequest;
}

export interface State {
    requestParams: RequestParams;
    strategyListRes: GetStrategyListResponse;
}

const initialState: State = {
    requestParams: null,
    strategyListRes: null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        case actions.GET_STRATEGY_LIST:
            return { ...state, requestParams: { ...state.requestParams, strategyList: action.payload } };

        case actions.GET_STRATEGY_LIST_FAIL:
            return { ...state, strategyListRes: action.payload };
        case actions.GET_STRATEGY_LIST_SUCCESS: {
            const { all, strategies } = action.payload.result;

            const result = addCustomFields(strategies);

            return { ...state, strategyListRes: { ...action.payload, result: { ...action.payload.result, strategies: result } } };
        }

        default:
            return state;
    }
}

function addCustomFields(data: Strategy[]): Strategy[] {
    const templateSnapshots = data.filter(strategy => strategy.category === CategoryType.TEMPLATE_SNAPSHOT || strategy.category === CategoryType.TEMPLATE_LIBRARY);

    return data.map(strategy => strategy.category === CategoryType.TEMPLATE_SNAPSHOT ? strategy : {
        ...strategy,
        semanticArgs: createScriptArgs(JSON.parse(strategy.args)),
        semanticTemplateArgs: strategy.templates ? strategy.templates.map(tplId => {
            const template = templateSnapshots.find(snapshot => snapshot.id === tplId);

            return template && ({ id: template.id, name: template.name, category: template.category, variables: createScriptArgs(JSON.parse(template.args)) });
        }).filter(item => !!item) : null
    });
}

export const getStrategyListRes = (state: State) => state.strategyListRes;

export const getRequestParams = (state: State) => state.requestParams;
