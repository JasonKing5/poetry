import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().email("请输入合法的邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
})