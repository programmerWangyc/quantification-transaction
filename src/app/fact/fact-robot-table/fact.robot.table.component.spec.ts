import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactRobotTableComponent } from './fact.robot.table.component';

describe('FactRobotTableComponent', () => {
    let component: FactRobotTableComponent;
    let fixture: ComponentFixture<FactRobotTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FactRobotTableComponent],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FactRobotTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
