
export interface ImportedArg {
    variableName: string;
    variableValue: string | number | boolean;
    templateId?: number;
}

export interface RobotStatusTable {
    type: string;
    title: string;
    cols: string[];
    rows: any[][];
}
