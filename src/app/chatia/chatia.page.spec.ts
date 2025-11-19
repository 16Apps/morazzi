import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatiaPage } from './chatia.page';

describe('ChatiaPage', () => {
  let component: ChatiaPage;
  let fixture: ComponentFixture<ChatiaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatiaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
