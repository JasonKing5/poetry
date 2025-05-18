import { z } from "zod"

export type Role = "admin" | "user";

export const AuthStatus = {
  Login: "login",
  Register: "register",
  ResetPassword: "reset-password"
}

export interface UserBase {
  id: number;
  email: string;
  username: string;
  role: Role;
  avatar?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  role: Role;
  password: string;
}

export interface RegisterResponse extends UserBase {}

export interface CreateUserRequest {
  username: string;
  email: string;
}

export interface CreateUserResponse extends UserBase {}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends UserBase {
  token: string;
  refreshToken: string;
  user: UserBase;
}

export interface UserResponse extends UserBase {
}

export interface UpdateUserRequest extends UserBase {
}

export interface UpdatePasswordRequest {
  email: string;
  password: string;
  token: string;
}

export interface UpdateUserResponse extends UserBase {
}

export const loginSchema = z.object({
  email: z.string().email("请输入正确的邮箱"),
  password: z.string().min(6, "密码至少6位")
})

export const registerSchema = z.object({
  username: z.string().min(2, "用户名至少2个字符"),
  email: z.string().email("请输入正确的邮箱"),
  password: z.string().min(6, "密码至少6位"),
  role: z.enum(["user", "admin"], { required_error: "请选择角色" })
})

export const resetPasswordSchema = z.object({
  email: z.string().email("请输入正确的邮箱")
})

export const updatePasswordSchema = z.object({
  email: z.string().email("请输入正确的邮箱"),
  password: z.string().min(6, "密码至少6位"),
})

export const settingsSchema = z.object({
  username: z.string().min(2, "用户名至少2个字符"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>
export type SettingsFormValues = z.infer<typeof settingsSchema>
