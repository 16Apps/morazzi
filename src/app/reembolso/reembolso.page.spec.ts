import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReembolsoPage } from './reembolso.page';

describe('ReembolsoPage', () => {
  let component: ReembolsoPage;
  let fixture: ComponentFixture<ReembolsoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReembolsoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
