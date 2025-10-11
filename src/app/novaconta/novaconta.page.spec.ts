import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovacontaPage } from './novaconta.page';

describe('NovacontaPage', () => {
  let component: NovacontaPage;
  let fixture: ComponentFixture<NovacontaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NovacontaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
