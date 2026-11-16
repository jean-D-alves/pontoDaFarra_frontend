export type ChangeOwnPasswordInput = {
  newPassword: string;
};

export type AdminResetPasswordInput = {
  newPassword: string;
};

export type PasswordField = "newPassword" | "confirmPassword" | "form";

export type PasswordFormField = Exclude<PasswordField, "form">;
