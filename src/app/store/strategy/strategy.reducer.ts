import { CategoryType, GetStrategyListRequest, ShareStrategyRequest, GenKeyRequest, VerifyKeyRequest } from '../../interfaces/request.interface';
import { createScriptArgs } from '../robot/robot.reducer';
import { GetStrategyListResponse, Strategy, ShareStrategyResponse, GenKeyResponse, VerifyKeyResponse } from './../../interfaces/response.interface';
import * as actions from './strategy.action';

export interface RequestParams {
    strategyList: GetStrategyListRequest;
    shareStrategy: ShareStrategyRequest;
    genKey: GenKeyRequest;
    verifyKey: VerifyKeyRequest;
}

export interface State {
    requestParams: RequestParams;
    strategyListRes: GetStrategyListResponse;
    shareStrategyRes: ShareStrategyResponse;
    genKeyRes: GenKeyResponse;
    verifyKeyRes: VerifyKeyResponse;
}

const initialState: State = {
    requestParams: null,
    strategyListRes: null,
    shareStrategyRes: null,
    genKeyRes: null,
    verifyKeyRes: null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // strategy list
        case actions.GET_STRATEGY_LIST:
            return { ...state, requestParams: { ...state.requestParams, strategyList: action.payload } };

        case actions.GET_STRATEGY_LIST_FAIL:
            return { ...state, strategyListRes: action.payload };

        case actions.GET_STRATEGY_LIST_SUCCESS: {
            const { all, strategies } = action.payload.result;

            const result = addCustomFields(strategies);

            return { ...state, strategyListRes: { ...action.payload, result: { ...action.payload.result, strategies: result } } };
        }

        // share strategy
        case actions.SHARE_STRATEGY:
            return { ...state, requestParams: { ...state.requestParams, shareStrategy: action.payload } };

        case actions.SHARE_STRATEGY_FAIL:
            return { ...state, shareStrategyRes: action.payload };

        case actions.SHARE_STRATEGY_SUCCESS: {
            const { result } = state.strategyListRes

            let { all, strategies } = result;

            const { shareStrategy } = state.requestParams

            strategies = strategies.map(strategy => strategy.id === shareStrategy.id ? { ...strategy, public: shareStrategy.type } : strategy);

            return { ...state, shareStrategyRes: action.payload, strategyListRes: { ...state.strategyListRes, result: { all, strategies } } };
        }

        // gen key
        case actions.GEN_KEY:
            return { ...state, requestParams: { ...state.requestParams, genKey: action.payload } };

        case actions.GEN_KEY_FAIL:
        case actions.GEN_KEY_SUCCESS:
            return { ...state, genKeyRes: action.payload };

        // verify gen key
        case actions.VERIFY_KEY:
            return { ...state, requestParams: { ...state.requestParams, verifyKey: action.payload } };

        case actions.VERIFY_KEY_FAIL:
        case actions.VERIFY_KEY_SUCCESS:
            return { ...state, verifyKeyRes: action.payload };

        default:
            return state;
    }
}

function addCustomFields(data: Strategy[]): Strategy[] {
    const templateSnapshots = data.filter(strategy => strategy.category === CategoryType.TEMPLATE_SNAPSHOT || strategy.category === CategoryType.TEMPLATE_LIBRARY);

    return data.map(strategy => strategy.category === CategoryType.TEMPLATE_SNAPSHOT ? strategy : {
        ...strategy,
        semanticArgs: strategy.args ? createScriptArgs(JSON.parse(strategy.args)) : null,
        semanticTemplateArgs: strategy.templates ? strategy.templates.map(tplId => {
            const template = templateSnapshots.find(snapshot => snapshot.id === tplId);

            return template && ({ id: template.id, name: template.name, category: template.category, variables: createScriptArgs(JSON.parse(template.args)) });
        }).filter(item => !!item) : null
    });
}

export const getStrategyListRes = (state: State) => state.strategyListRes;

export const getRequestParams = (state: State) => state.requestParams;

export const getShareStrategyRes = (state: State) => state.shareStrategyRes;

export const getGenKeyResponse = (state: State) => state.genKeyRes;

export const getVerifyKeyRes = (state: State) => state.verifyKeyRes;
