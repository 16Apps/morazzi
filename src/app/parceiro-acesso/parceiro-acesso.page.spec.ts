import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParceiroAcessoPage } from './parceiro-acesso.page';

describe('ParceiroAcessoPage', () => {
  let component: ParceiroAcessoPage;
  let fixture: ComponentFixture<ParceiroAcessoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ParceiroAcessoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
