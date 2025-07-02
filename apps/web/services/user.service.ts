import { useDel, useGet, usePost, usePut } from "@/lib/request";

export const useRegister = (options: any) => {
  return usePost('/auth/register', options);
}

export const useLogin = (options: any) => {
  return usePost('/auth/login', options);
}

export const useLogout = () => {
  return usePost('/auth/logout');
}

export const useResetEmail = (options: any) => {
  return usePost('/auth/reset/email', options);
}

export const useResetPassword = (options: any) => {
  return usePut('/auth/reset/password', options);
}

export const useCreateUser = () => {
  return usePost('/users');
}

export const useGetUser = (id: string) => {
  return useGet(`/users/${id}`);
}

export const useGetAllUsers = (options: any) => {
  return useGet('/users', options);
}

export const useUpdateUser = (options: any) => {
  return usePut(`/users`, options);
}

export const useDeleteUser = (id: string) => {
  return useDel(`/users/${id}`);
}
