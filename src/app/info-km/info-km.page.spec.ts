import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoKmPage } from './info-km.page';

describe('InfoKmPage', () => {
  let component: InfoKmPage;
  let fixture: ComponentFixture<InfoKmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoKmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
