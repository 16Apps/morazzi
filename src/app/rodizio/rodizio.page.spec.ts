import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RodizioPage } from './rodizio.page';

describe('RodizioPage', () => {
  let component: RodizioPage;
  let fixture: ComponentFixture<RodizioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RodizioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
