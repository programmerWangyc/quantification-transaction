import { Component, OnInit } from '@angular/core';

import { of } from 'rxjs';

import { Breadcrumb } from '../../interfaces/app.interface';
import { SimulationService } from '../providers/simulation.service';

@Component({
    selector: 'app-simulation',
    templateUrl: './simulation.component.html',
    styleUrls: ['./simulation.component.scss'],
})
export class SimulationComponent implements OnInit {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'FIRMWARE_SIMULATION' }];

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private simulationService: SimulationService,
    ) { }

    ngOnInit() {
        this.simulationService.launchSandboxToken(of(null));
    }

}
