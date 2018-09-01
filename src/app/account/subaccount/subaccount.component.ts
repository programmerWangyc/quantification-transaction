import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable, of, Subject } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

import { Breadcrumb } from '../../interfaces/app.interface';
import { SaveShadowMemberRequest } from '../../interfaces/request.interface';
import { ShadowMember } from '../../interfaces/response.interface';
import { EncryptService } from '../../providers/encrypt.service';
import { passwordValidator, usernameValidator } from '../../validators/validators';
import { FormTypeBaseComponent } from '../base/base';
import { SubaccountService } from '../providers/subaccount.service';

interface SubaccountForm {
    username: string;
    password: string;
}

interface Robot {
    label: string;
    value: number;
    checked: boolean;
}

@Component({
    selector: 'app-subaccount',
    templateUrl: './subaccount.component.html',
    styleUrls: ['./subaccount.component.scss'],
})
export class SubaccountComponent extends FormTypeBaseComponent {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'ACCOUNT_MANAGEMENT' }, { name: 'SUBACCOUNT_GROUP' }];

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    form: FormGroup;

    /**
     * @ignore
     */
    submit$: Subject<SubaccountForm> = new Subject();

    /**
     * 已创建的子帐户列表
     */
    accounts: Observable<ShadowMember[]>;

    /**
     * Select all robot;
     */
    allChecked = true;

    /**
     * 控制全选按钮样式
     */
    indeterminate = true;

    /**
     * 可选的机器人
     */
    robots: Robot[];

    /**
     * 未选中的任何机器人
     */
    noneSelectedRobot = false;

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    constructor(
        private fb: FormBuilder,
        private accountService: SubaccountService,
        private encrypt: EncryptService,
    ) {
        super();

        this.initForm();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    launch() {
        const keepAlive = () => this.isAlive;

        this.accountService.launchAccount(of(null));

        this.accountService.handleAccountError(keepAlive);

        this.accountService.launchShadowMember(of(null));

        this.accountService.handleGetShadowMemberError(keepAlive);

        this.accountService.launchAddShadowMember(
            this.submit$.pipe(
                takeWhile(keepAlive),
                map(({ username, password }) => ({
                    memberId: -1,
                    username,
                    password: this.encrypt.encryptPassword(password),
                    permissions: this.robots.filter(robot => robot.checked).map(robot => robot.value),
                }))
            )
        );
    }

    /**
     * @ignore
     */
    initialModel() {
        this.accounts = this.accountService.getShadowMemberAccounts();

        this.accountService.getAvailableRobots().pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(robots => this.robots = robots.map(({ id, name }) => ({ label: name, value: id, checked: true })));

        this.isLoading = this.accountService.isLoading();
    }

    /**
     * @ignore
     */
    private initForm(): void {
        this.form = this.fb.group({
            username: ['', [Validators.required, usernameValidator]],
            password: ['', [Validators.required, passwordValidator]],
        });
    }

    /**
     * @ignore
     */
    updateSingleChecked(): void {
        if (this.robots.every(item => item.checked === false)) {
            this.allChecked = false;

            this.indeterminate = false;

            this.noneSelectedRobot = true;
        } else if (this.robots.every(item => item.checked === true)) {
            this.allChecked = true;

            this.indeterminate = false;

            this.noneSelectedRobot = false;
        } else {
            this.indeterminate = true;

            this.noneSelectedRobot = false;
        }
    }

    /**
     * @ignore
     */
    updateAllChecked(): void {
        this.indeterminate = false;

        if (this.allChecked) {
            this.robots.forEach(item => item.checked = true);
            this.noneSelectedRobot = false;
        } else {
            this.robots.forEach(item => item.checked = false);
            this.noneSelectedRobot = true;
        }
    }

    /**
     * @ignore
     */
    onDelete(target: ShadowMember): void {
        this.accountService.launchDeleteShadowMember(of({ memberId: target.id }));
    }

    /**
     * @ignore
     */
    onLock(target: ShadowMember): void {
        const { id, status } = target;

        this.accountService.launchLockShadowMember(of({ memberId: id, status }));
    }

    /**
     * @ignore
     */
    onUpdateSubaccount(target: SaveShadowMemberRequest): void {
        let { password } = target;

        password = password ? this.encrypt.encryptPassword(password) : password;

        this.accountService.launchUpdateShadowMember(of({ ...target, password }));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }

    /**
     * @ignore
     */
    get username(): AbstractControl {
        return this.form.get('username');
    }

    /**
     * @ignore
     */
    get password(): AbstractControl {
        return this.form.get('password');
    }
}
