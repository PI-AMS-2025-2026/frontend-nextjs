import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next dev aceita recursos internos quando o frontend é acessado por qualquer IP/host.
  allowedDevOrigins: ['**.*'],
  reactCompiler: true,
  // Gera a saída mínima auto-contida em `.next/standalone`, usada pela imagem Docker.
  output: "standalone",
};

export default nextConfig;
