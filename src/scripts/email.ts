import { SITE } from '../data/site';

export const getEmail = () => atob(SITE.emailB64);

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(getEmail());
    return true;
  } catch {
    return false;
  }
}
