import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdemPage } from './ordem.page';

describe('OrdemPage', () => {
  let component: OrdemPage;
  let fixture: ComponentFixture<OrdemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
