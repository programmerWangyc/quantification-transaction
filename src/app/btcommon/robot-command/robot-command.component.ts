import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { BusinessComponent } from '../../interfaces/business.interface';
import { VariableOverview } from './../../interfaces/constant.interface';
import { RobotOperateService } from './../providers/robot.operate.service';
import { RobotService } from './../providers/robot.service';

@Component({
    selector: 'app-robot-command',
    templateUrl: './robot-command.component.html',
    styleUrls: ['./robot-command.component.scss'],
})
export class RobotCommandComponent extends BusinessComponent {

    isFold = false;

    commandArgs: Observable<VariableOverview[]>;

    hasArgs: Observable<boolean>;

    subscription$$: Subscription;

    command$: Subject<VariableOverview> = new Subject();

    constructor(
        public render: Renderer2,
        public eleRef: ElementRef,
        private robotService: RobotService,
        private robotOperate: RobotOperateService,
    ) {
        super(render, eleRef);
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.commandArgs = this.robotOperate.getRobotCommandArgs();

        this.hasArgs = this.commandArgs.map(args => !!args.length);
    }

    launch() {
        this.subscription$$ = this.robotOperate.launchCommandRobot(this.command$)
            .add(this.robotOperate.handleCommandRobotError());
    }

    argChange(arg: VariableOverview): void {
        arg.variableName && this.robotOperate.updateRobotArg(arg);
    }

    toggleFold() {
        this.isFold = !this.isFold;
        
        this.toggle(this.isFold);
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
