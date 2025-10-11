import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrcamentoDetalhePage } from './orcamento-detalhe.page';

describe('OrcamentoDetalhePage', () => {
  let component: OrcamentoDetalhePage;
  let fixture: ComponentFixture<OrcamentoDetalhePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrcamentoDetalhePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
