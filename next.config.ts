import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.11.159'],
  reactCompiler: true,
  // Gera a saída mínima auto-contida em `.next/standalone`, usada pela imagem Docker.
  output: "standalone",
};

export default nextConfig;
