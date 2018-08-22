import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NzModalRef } from 'ng-zorro-antd';

import { ShadowMember } from '../../interfaces/response.interface';
import { passwordValidator } from '../../validators/validators';

@Component({
    selector: 'app-modify-subaccount-password',
    templateUrl: './modify-subaccount-password.component.html',
    styleUrls: ['./modify-subaccount-password.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModifySubaccountPasswordComponent implements OnInit {

    @Input() set data(input: ShadowMember) {
        if (!!input) {
            this.form.get('username').patchValue(input.username);
        }
    }

    /**
     * @ignore
     */
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private modalRef: NzModalRef,
    ) {
        this.initForm();
    }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * @ignore
     */
    private initForm(): void {
        this.form = this.fb.group({
            username: { value: '', disabled: true },
            password: [, [Validators.required, passwordValidator]],
        });
    }

    /**
     * @ignore
     */
    close(value) {
        this.modalRef.close(value);
    }

    /**
     * @ignore
     */
    get password(): AbstractControl {
        return this.form.get('password');
    }
}
