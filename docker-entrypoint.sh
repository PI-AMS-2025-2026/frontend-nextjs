#!/bin/sh
# Entrypoint da imagem do frontend.
#
# A imagem é ÚNICA para todos os ambientes: o build embute no bundle uma URL
# fixa de placeholder. Na inicialização, este script troca o placeholder pela
# URL real recebida em API_URL (obrigatória).
#
# A substituição altera os arquivos do próprio container. Por isso:
#   - reiniciar o container (docker restart) com a mesma API_URL funciona;
#   - TROCAR a API_URL exige RECRIAR o container (docker compose up -d recria
#     automaticamente quando o ambiente do serviço muda).
set -eu

PLACEHOLDER="http://gini-api-placeholder.invalid"
# Versão do placeholder para uso como padrão no sed (pontos escapados).
PLACEHOLDER_RE='http://gini-api-placeholder\.invalid'
APP_DIR="/app"
# Registra a URL aplicada para detectar troca de API_URL sem recriar o container.
MARKER="$APP_DIR/.next/.api-url-aplicada"

log() {
  echo "[entrypoint] $*"
}

erro() {
  echo "[entrypoint] ERRO: $*" >&2
  exit 1
}

# Lista (um por linha) os arquivos que ainda contêm o placeholder.
arquivos_com_placeholder() {
  grep -rlF -- "$PLACEHOLDER" "$APP_DIR/server.js" "$APP_DIR/.next" 2>/dev/null || true
}

API_URL="${API_URL:-}"

if [ -z "$API_URL" ]; then
  erro "API_URL não definida: esta imagem exige a URL da API em runtime"
fi

# Apenas esquema, host e porta opcional: sem barra final, caminho, espaços ou
# caracteres especiais (o valor vai para o sed e para o bundle do navegador).
if ! printf '%s' "$API_URL" | grep -Eq '^https?://[A-Za-z0-9._-]+(:[0-9]{1,5})?$'; then
  erro "API_URL inválida. Use apenas esquema, host e porta opcional, sem barra final nem caminho (ex.: https://api.exemplo.com ou http://10.0.0.5:8081)."
fi

arquivos="$(arquivos_com_placeholder)"

if [ -n "$arquivos" ]; then
  # Defesa extra: escapa os caracteres especiais da substituição do sed
  # (\, & e o delimitador |), embora a regex acima já não os permita.
  url_escapada="$(printf '%s' "$API_URL" | sed 's/[\\|&]/\\&/g')"

  total=0
  # Nomes de arquivo gerados pelo Next.js não contêm quebras de linha.
  while IFS= read -r arquivo; do
    [ -n "$arquivo" ] || continue
    sed -i "s|$PLACEHOLDER_RE|$url_escapada|g" "$arquivo"
    total=$((total + 1))
  done <<EOF
$arquivos
EOF

  if [ -n "$(arquivos_com_placeholder)" ]; then
    erro "o placeholder da URL da API continua presente após a substituição."
  fi

  printf '%s\n' "$API_URL" > "$MARKER"
  log "URL da API configurada em runtime ($total arquivo(s) alterado(s))."
elif [ -f "$MARKER" ]; then
  # Restart do mesmo container: a substituição já foi feita antes.
  if [ "$(cat "$MARKER")" = "$API_URL" ]; then
    log "URL da API já configurada neste container; nada a fazer."
  else
    erro "API_URL mudou, mas este container já foi configurado com outra URL. Recrie o container (ex.: docker compose up -d --force-recreate frontend)."
  fi
else
  # Sem placeholder e sem registro de configuração: a imagem não foi gerada
  # pelo Dockerfile atual (ex.: imagem antiga com a URL embutida no build).
  erro "placeholder da URL da API não encontrado: esta imagem não suporta API_URL em runtime. Use uma imagem publicada pelo fluxo atual."
fi

exec "$@"
