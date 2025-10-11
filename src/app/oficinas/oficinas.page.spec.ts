import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OficinasPage } from './oficinas.page';

describe('OficinasPage', () => {
  let component: OficinasPage;
  let fixture: ComponentFixture<OficinasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OficinasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
