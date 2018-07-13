import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseComponent, FoldableBusinessComponent } from '../../base/base.component';
import { VariableOverview } from '../../interfaces/app.interface';
import { RobotOperateService } from '../providers/robot.operate.service';
import { RobotService } from '../providers/robot.service';


@Component({
    selector: 'app-robot-command',
    templateUrl: './robot-command.component.html',
    styleUrls: ['./robot-command.component.scss'],
})
export class RobotCommandComponent extends FoldableBusinessComponent implements BaseComponent {

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

        this.hasArgs = this.commandArgs
            .pipe(
                map(args => !!args.length)
            );
    }

    launch() {
        this.subscription$$ = this.robotOperate.launchCommandRobot(this.command$)
            .add(this.robotOperate.handleCommandRobotError());
    }

    argChange(arg: VariableOverview): void {
        arg.variableName && this.robotOperate.updateRobotArg(arg);
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
