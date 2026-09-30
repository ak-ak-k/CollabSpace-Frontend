import { TestBed } from '@angular/core/testing';
import { AvatarGroupComponent, AvatarGroupMember } from './avatar-group.component';

const MEMBERS: AvatarGroupMember[] = [
  { id: 'u1', name: 'Rahul Mehta', seed: 1 },
  { id: 'u2', name: 'Priya Sharma', seed: 2 },
  { id: 'u4', name: 'Kavya Reddy', seed: 4 },
  { id: 'u5', name: 'Ananya Iyer', seed: 5 },
];

describe('AvatarGroupComponent', () => {
  it('shows at most three members by default', async () => {
    const fixture = TestBed.createComponent(AvatarGroupComponent);
    fixture.componentRef.setInput('members', MEMBERS);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-avatar').length).toBe(3);
  });

  it('respects a custom limit', async () => {
    const fixture = TestBed.createComponent(AvatarGroupComponent);
    fixture.componentRef.setInput('members', MEMBERS);
    fixture.componentRef.setInput('max', 2);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-avatar').length).toBe(2);
  });

  it('counts the members that do not fit when overflow is shown', async () => {
    const fixture = TestBed.createComponent(AvatarGroupComponent);
    fixture.componentRef.setInput('members', MEMBERS);
    fixture.componentRef.setInput('max', 2);
    fixture.componentRef.setInput('showOverflow', true);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.avatar-group__more')?.textContent?.trim()).toBe('+2');
  });
});
