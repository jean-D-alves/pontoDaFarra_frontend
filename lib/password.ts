export const PASSWORD_MIN_LENGTH = 8;

/**
 * Regras de força compartilhadas pelo cadastro e pela troca de senha.
 * Devem acompanhar `UserServices.ValidatePassword` no backend.
 */
export function validatePasswordStrength(value: string): string | null {
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "A senha deve conter pelo menos uma letra e um número.";
  }

  return null;
}
