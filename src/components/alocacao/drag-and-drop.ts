import type { DisciplineDragData } from "./tipos";

export const DISCIPLINE_DND_MIME = "application/x-discipline+json";

export function ehDragDeDisciplina(transfer: DataTransfer) {
  return [...transfer.types].some((tipo) =>
    [DISCIPLINE_DND_MIME, "text/plain", "discipline"].includes(tipo),
  );
}

export function lerDisciplinaArrastada(
  transfer: DataTransfer,
): DisciplineDragData | null {
  const texto =
    transfer.getData(DISCIPLINE_DND_MIME) ||
    transfer.getData("text/plain") ||
    transfer.getData("discipline");
  if (!texto || texto.length > 16_384) return null;
  try {
    const dados: unknown = JSON.parse(texto);
    if (!dados || typeof dados !== "object" || !("id" in dados)) return null;
    const id = dados.id;
    if (typeof id !== "string" || !id.trim()) return null;
    const aulaId = "aulaId" in dados ? dados.aulaId : undefined;
    if (aulaId !== undefined && (typeof aulaId !== "string" || !aulaId.trim()))
      return null;
    return { id, aulaId };
  } catch {
    return null;
  }
}
