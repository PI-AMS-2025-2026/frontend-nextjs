export const SENHA_FORTE_MENSAGEM =
  "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula e uma letra minúscula.";

export function senhaForte(senha: string): boolean {
  return Array.from(senha).length >= 8 && /\p{Lu}/u.test(senha) && /\p{Ll}/u.test(senha);
}
