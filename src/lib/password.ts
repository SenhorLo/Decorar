/**
 * Política de senha.
 *
 * Vive separado dos validadores porque o mesmo conjunto de regras roda nos
 * dois lados: o formulário mostra os requisitos em tempo real e a Server
 * Action revalida antes de gravar. Um módulo só evita as duas listas
 * divergirem — o pior tipo de bug de formulário é aquele em que a interface
 * diz "ok" e o servidor recusa.
 */

/** Limite do bcrypt: ele ignora bytes além de 72, então recusamos antes. */
export const PASSWORD_MAX = 72;
export const PASSWORD_MIN = 8;

export type PasswordRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

/** Caracteres especiais aceitos — qualquer coisa que não seja letra ou número. */
const ESPECIAL = /[^A-Za-z0-9]/;

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "tamanho",
    label: `${PASSWORD_MIN} caracteres ou mais`,
    test: (v) => v.length >= PASSWORD_MIN,
  },
  {
    id: "maiuscula",
    label: "Uma letra maiúscula",
    test: (v) => /[A-ZÀ-ÖØ-Þ]/.test(v),
  },
  {
    id: "minuscula",
    label: "Uma letra minúscula",
    test: (v) => /[a-zß-öø-ÿ]/.test(v),
  },
  { id: "numero", label: "Um número", test: (v) => /[0-9]/.test(v) },
  { id: "especial", label: "Um caractere especial", test: (v) => ESPECIAL.test(v) },
];

/**
 * Senhas que passam nas regras acima mas são as primeiras que um atacante
 * tenta. "Senha@123" cumpre maiúscula, minúscula, número e especial — e está
 * em qualquer lista de senhas vazadas.
 */
const OBVIAS = [
  "senha", "password", "123456", "abcdef", "qwerty", "admin",
  "decorar", "mudar", "trocar", "teste", "letmein", "iloveyou",
];

/** Sequências triviais de teclado ou alfabeto. */
const SEQUENCIAS = [
  "0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm",
];

function temSequencia(valor: string, tamanho = 4): boolean {
  const v = valor.toLowerCase();

  for (const seq of SEQUENCIAS) {
    for (let i = 0; i + tamanho <= seq.length; i++) {
      const trecho = seq.slice(i, i + tamanho);
      const invertido = [...trecho].reverse().join("");
      if (v.includes(trecho) || v.includes(invertido)) return true;
    }
  }

  return false;
}

function temRepeticao(valor: string): boolean {
  return /(.)\1{3,}/.test(valor); // "aaaa", "1111"
}

export type PasswordCheck = {
  ok: boolean;
  /** Regras não cumpridas, na ordem em que aparecem na interface. */
  faltando: PasswordRule[];
  /** Motivo extra quando a senha cumpre as regras mas ainda é fraca. */
  fraca: string | null;
};

export function checkPassword(value: string): PasswordCheck {
  const faltando = PASSWORD_RULES.filter((r) => !r.test(value));

  let fraca: string | null = null;
  const minusculo = value.toLowerCase();

  if (value.length > PASSWORD_MAX) {
    fraca = `A senha pode ter no máximo ${PASSWORD_MAX} caracteres.`;
  } else if (OBVIAS.some((p) => minusculo.includes(p))) {
    fraca = "Essa senha contém uma palavra muito comum. Escolha outra.";
  } else if (temSequencia(value)) {
    fraca = "Evite sequências como 1234 ou abcd.";
  } else if (temRepeticao(value)) {
    fraca = "Evite repetir o mesmo caractere várias vezes.";
  }

  return { ok: faltando.length === 0 && fraca === null, faltando, fraca };
}

/**
 * 0 a 4 — usado só para a barra visual, não para aprovar ou recusar.
 *
 * Nunca devolve 0 para senha preenchida: 0 não tem rótulo, e a barra ficaria
 * escrita "Força:" sem nada depois. E qualquer senha que será recusada fica
 * em "Fraca", para a barra não dizer "Razoável" sobre algo que o servidor
 * vai negar.
 */
export function passwordStrength(value: string): number {
  if (!value) return 0;

  const check = checkPassword(value);
  if (!check.ok) {
    if (check.fraca) return 1;

    const cumpridas = PASSWORD_RULES.length - check.faltando.length;
    return Math.max(1, Math.min(2, Math.round((cumpridas / PASSWORD_RULES.length) * 2)));
  }

  if (value.length >= 16) return 4;
  if (value.length >= 12) return 3;
  return 2;
}

export const STRENGTH_LABELS = ["", "Fraca", "Razoável", "Boa", "Forte"] as const;
