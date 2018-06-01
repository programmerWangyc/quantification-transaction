import { ShareStrategyRequest } from '../interfaces/request.interface';


export interface ShareStrategyStateSnapshot extends ShareStrategyRequest {
    currentType: number; // strategy's public field;
}
