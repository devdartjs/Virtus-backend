import { describe, it, expect } from "vitest";

function soma(a: number, b: number): number {
  return a + b;
}

describe("Função soma", () => {
  it("deve somar dois números corretamente", () => {
    expect(soma(2, 3)).toBe(5);
  });

  it("não deve retornar valor incorreto", () => {
    expect(soma(2, 3)).not.toBe(6);
  });
});
