import {
    CategoryType, DeleteStrategyRequest, GenKeyRequest, GetStrategyDetailRequest, GetStrategyListRequest,
    OpStrategyTokenRequest, SaveStrategyRequest, ShareStrategyRequest, VerifyKeyRequest, GetStrategyListByNameRequest, GetPublicStrategyDetailRequest
} from '../../interfaces/request.interface';
import {
    DeleteStrategyResponse, GenKeyResponse, GetStrategyDetailResponse, GetStrategyListResponse, OpStrategyTokenResponse,
    SaveStrategyResponse, ShareStrategyResponse, Strategy, VerifyKeyResponse, GetStrategyListByNameResponse, GetPublicStrategyDetailResponse
} from '../../interfaces/response.interface';
import { createScriptArgs } from '../robot/robot.reducer';
import * as actions from './strategy.action';

export interface RequestParams {
    deleteStrategy: DeleteStrategyRequest;
    genKey: GenKeyRequest;
    opStrategyToken: OpStrategyTokenRequest;
    publicStrategyDetail: GetPublicStrategyDetailRequest;
    saveStrategy: SaveStrategyRequest;
    shareStrategy: ShareStrategyRequest;
    strategyDetail: GetStrategyDetailRequest;
    strategyList: GetStrategyListRequest;
    strategyListByName: GetStrategyListByNameRequest;
    verifyKey: VerifyKeyRequest;
}

export interface UIState {
    loading: boolean;
    selectedLanguage: number;
    selectedTemplates: number[];
    codeSnapshot: string;
}

export interface State {
    UIState: UIState;
    deleteStrategyRes: DeleteStrategyResponse;
    genKeyRes: GenKeyResponse;
    opStrategyTokenRes: OpStrategyTokenResponse;
    publicStrategyDetailRes: GetPublicStrategyDetailResponse;
    requestParams: RequestParams;
    saveStrategyRes: SaveStrategyResponse;
    shareStrategyRes: ShareStrategyResponse;
    strategyDetailRes: GetStrategyDetailResponse;
    strategyListByNameRes: GetStrategyListByNameResponse;
    strategyListRes: GetStrategyListResponse;
    verifyKeyRes: VerifyKeyResponse;
}

const initialState: State = {
    UIState: null,
    deleteStrategyRes: null,
    genKeyRes: null,
    opStrategyTokenRes: null,
    publicStrategyDetailRes: null,
    requestParams: null,
    saveStrategyRes: null,
    shareStrategyRes: null,
    strategyDetailRes: null,
    strategyListByNameRes: null,
    strategyListRes: null,
    verifyKeyRes: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // strategy list
        case actions.GET_STRATEGY_LIST:
            return { ...state, requestParams: { ...state.requestParams, strategyList: action.payload }, UIState: { ...state.UIState, loading: true } };

        case actions.GET_STRATEGY_LIST_FAIL:
            return { ...state, strategyListRes: action.payload, UIState: { ...state.UIState, loading: false } };

        case actions.GET_STRATEGY_LIST_SUCCESS: {
            const { strategies } = action.payload.result;

            const result = addCustomFields(strategies);

            return { ...state, strategyListRes: { ...action.payload, result: { ...action.payload.result, strategies: result } }, UIState: { ...state.UIState, loading: false } };
        }

        // share strategy
        case actions.SHARE_STRATEGY:
            return { ...state, requestParams: { ...state.requestParams, shareStrategy: action.payload } };

        case actions.SHARE_STRATEGY_FAIL:
            return { ...state, shareStrategyRes: action.payload };

        case actions.SHARE_STRATEGY_SUCCESS: {
            const { result } = state.strategyListRes;

            const { all } = result;

            const { shareStrategy } = state.requestParams;

            const strategies = result.strategies.map(strategy => strategy.id === shareStrategy.id ? { ...strategy, public: shareStrategy.type } : strategy);

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

        // delete strategy
        case actions.DELETE_STRATEGY:
            return { ...state, requestParams: { ...state.requestParams, deleteStrategy: action.payload } };

        case actions.DELETE_STRATEGY_FAIL:
            return { ...state, deleteStrategyRes: action.payload };

        case actions.DELETE_STRATEGY_SUCCESS: {
            const { id } = state.requestParams.deleteStrategy;

            const { result } = state.strategyListRes;

            const { all } = result;

            const strategies = result.strategies.filter(strategy => strategy.id !== id);

            return { ...state, deleteStrategyRes: action.payload, strategyListRes: { ...state.strategyListRes, result: { all, strategies } } };
        }

        // op strategy token
        case actions.GET_STRATEGY_TOKEN:
            return { ...state, requestParams: { ...state.requestParams, opStrategyToken: action.payload } };

        case actions.GET_STRATEGY_TOKEN_FAIL:
        case actions.GET_STRATEGY_TOKEN_SUCCESS:
            return { ...state, opStrategyTokenRes: action.payload };

        // strategy detail
        case actions.GET_STRATEGY_DETAIL:
            return { ...state, requestParams: { ...state.requestParams, strategyDetail: action.payload }, UIState: { ...state.UIState, loading: true } };

        case actions.GET_STRATEGY_DETAIL_FAIL:
            return { ...state, strategyDetailRes: action.payload, UIState: { ...state.UIState, loading: false } };

        case actions.GET_STRATEGY_DETAIL_SUCCESS: {
            const { args, templates } = action.payload.result.strategy;

            if (templates) {
                action.payload.result.strategy.templates = templates.map(tpl => ({ ...tpl, semanticArgs: createScriptArgs(JSON.parse(tpl.args)) }));
            }

            action.payload.result.strategy.semanticArgs = createScriptArgs(JSON.parse(args));

            return { ...state, strategyDetailRes: action.payload, UIState: { ...state.UIState, loading: false } };
        }

        // save strategy
        case actions.SAVE_STRATEGY:
            return { ...state, requestParams: { ...state.requestParams, saveStrategy: action.payload } };

        case actions.SAVE_STRATEGY_FAIL:
        case actions.SAVE_STRATEGY_SUCCESS:
            return { ...state, saveStrategyRes: action.payload };

        case actions.GET_STRATEGY_LIST_BY_NAME:
            return { ...state, requestParams: { ...state.requestParams, strategyListByName: action.payload }, UIState: { ...state.UIState, loading: true } };

        case actions.GET_STRATEGY_LIST_BY_NAME_FAIL:
        case actions.GET_STRATEGY_LIST_BY_NAME_SUCCESS:
            return { ...state, strategyListByNameRes: action.payload, UIState: { ...state.UIState, loading: false } };

        // public strategy detail
        case actions.GET_PUBLIC_STRATEGY_DETAIL:
            return { ...state, requestParams: { ...state.requestParams, publicStrategyDetail: action.payload }, UIState: { ...state.UIState, loading: true } };

        case actions.GET_PUBLIC_STRATEGY_DETAIL_FAIL:
        case actions.GET_PUBLIC_STRATEGY_DETAIL_SUCCESS:
            return { ...state, publicStrategyDetailRes: action.payload, UIState: { ...state.UIState, loading: false } };

        /**==================================================================Local State change=========================================== **/

        // update strategy hasToken
        case actions.UPDATE_STRATEGY_SECRET_KEY_STATE: {
            const { result } = state.strategyListRes;

            const { all } = result;

            const strategies = result.strategies.map(strategy => strategy.id === action.payload.id ? { ...strategy, hasToken: action.payload.hasToken } : strategy);

            return { ...state, strategyListRes: { ...state.strategyListRes, result: { all, strategies } } };
        }

        // reset state
        case actions.RESET_STATE:
            return {
                ...state,
                opStrategyTokenRes: null,
                genKeyRes: null,
                shareStrategyRes: null,
                deleteStrategyRes: null,
                strategyDetailRes: null,
                strategyListRes: null,
                requestParams: {
                    ...state.requestParams,
                    strategyDetail: null,
                    strategyList: null,
                    opStrategyToken: null,
                    deleteStrategy: null,
                    shareStrategy: null,
                },
                UIState: {
                    ...state.UIState,
                    codeSnapshot: null,
                },
            };

        // strategy dependance
        case actions.UPDATE_STRATEGY_DEPENDANCE_TEMPLATES:
            return { ...state, UIState: { ...state.UIState, selectedTemplates: action.payload } };

        // strategy language
        case actions.UPDATE_SELECTED_LANGUAGE:
            return { ...state, UIState: { ...state.UIState, selectedLanguage: action.payload } };

        // code snapshot
        case actions.SNAPSHOT_CODE:
            return { ...state, UIState: { ...state.UIState, codeSnapshot: action.payload } };

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
        }).filter(item => !!item) : null,
    });
}

export const getStrategyListRes = (state: State) => state.strategyListRes;

export const getRequestParams = (state: State) => state.requestParams;

export const getShareStrategyRes = (state: State) => state.shareStrategyRes;

export const getGenKeyResponse = (state: State) => state.genKeyRes;

export const getVerifyKeyRes = (state: State) => state.verifyKeyRes;

export const getDeleteStrategyRes = (state: State) => state.deleteStrategyRes;

export const getOpStrategyTokenRes = (state: State) => state.opStrategyTokenRes;

export const getStrategyDetailRes = (state: State) => state.strategyDetailRes;

export const getSaveStrategyRes = (state: State) => state.saveStrategyRes;

export const getUIState = (state: State) => state.UIState;

export const getStrategyListByNameResponse = (state: State) => state.strategyListByNameRes;

export const getPublicStrategyDetailResponse = (state: State) => state.publicStrategyDetailRes;
