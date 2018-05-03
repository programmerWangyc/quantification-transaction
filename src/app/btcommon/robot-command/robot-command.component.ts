import { UtilService } from './../../providers/util.service';
import { Subject } from 'rxjs/Subject';
import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { BusinessComponent } from '../../interfaces/business.interface';
import { VariableOverview } from './../../interfaces/constant.interface';
import { RobotService } from './../providers/robot.service';

@Component({
    selector: 'app-robot-command',
    templateUrl: './robot-command.component.html',
    styleUrls: ['./robot-command.component.scss'],
})
export class RobotCommandComponent extends BusinessComponent {

    isFold = false;

    commandArgs: Observable<VariableOverview[]>;

    subscription$$: Subscription;

    command$: Subject<VariableOverview> = new Subject();

    constructor(
        public render: Renderer2,
        public eleRef: ElementRef,
        private robotService: RobotService,
    ) {
        super(render, eleRef);
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.commandArgs = this.robotService.getRobotCommandArgs();
    }

    launch() {
        this.subscription$$ = this.robotService.launchCommandRobot(this.command$)
            .add(this.robotService.handleCommandRobotError());
    }

    argChange(arg: VariableOverview): void {
        arg.variableName && this.robotService.updateRobotArg(arg);
    }

    toggleFold() {
        this.isFold = !this.isFold;
        
        this.toggle(this.isFold);
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
