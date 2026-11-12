import { SITE } from '../data/profile';

export const getEmail = () => atob(SITE.emailB64);

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(getEmail());
    return true;
  } catch {
    return false;
  }
}
