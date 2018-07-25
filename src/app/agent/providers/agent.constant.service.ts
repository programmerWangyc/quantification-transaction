import { Injectable } from '@angular/core';

import { ConstantService } from '../../providers/constant.service';
import { AgentSystem, AgentSystemVersion } from '../agent.config';

export interface AgentClient {
    os: number;
    version: number;
    href: string;
    isCli?: boolean;
}

export const AGENT_CLIENTS: AgentClient[] = [
    { os: AgentSystem.windows, version: AgentSystemVersion.bit_32, href: 'robot_windows_386.zip', isCli: true },
    { os: AgentSystem.windows, version: AgentSystemVersion.bit_32, href: 'robot_windows_386_gui.zip', isCli: false },
    { os: AgentSystem.windows, version: AgentSystemVersion.bit_64, href: 'robot_windows_amd64.zip', isCli: true },
    { os: AgentSystem.windows, version: AgentSystemVersion.bit_64, href: 'robot_windows_amd64_gui.zip', isCli: false },
    { os: AgentSystem.linux, version: AgentSystemVersion.bit_32, href: 'robot_linux_386.tar.gz' },
    { os: AgentSystem.linux, version: AgentSystemVersion.bit_64, href: 'robot_linux_amd64.tar.gz' },
    { os: AgentSystem.linux, version: AgentSystemVersion.linux_v7, href: 'robot_linux_armv7l.tar.gz' },
    { os: AgentSystem.linux, version: AgentSystemVersion.linux_static, href: 'robot_linux_arm_static.tar.gz' },
    { os: AgentSystem.macOS, version: AgentSystemVersion.bit_64, href: 'robot_darwin_amd64.tar.gz' },
];

@Injectable()
export class AgentConstantService extends ConstantService {

    AGENT_CLIENTS = AGENT_CLIENTS;

    constructor() {
        super();
    }
}
