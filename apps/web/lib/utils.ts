import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserId() {
  const user = JSON.parse(localStorage.getItem('user-storage') || '{}').state.user;
  if (!user) {
    return null;
  }
  return Number(user.id);
}
