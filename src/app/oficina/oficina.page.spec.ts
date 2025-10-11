import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OficinaPage } from './oficina.page';

describe('OficinaPage', () => {
  let component: OficinaPage;
  let fixture: ComponentFixture<OficinaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OficinaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
