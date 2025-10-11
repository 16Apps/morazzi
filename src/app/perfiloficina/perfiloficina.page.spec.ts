import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfiloficinaPage } from './perfiloficina.page';

describe('PerfiloficinaPage', () => {
  let component: PerfiloficinaPage;
  let fixture: ComponentFixture<PerfiloficinaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfiloficinaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
