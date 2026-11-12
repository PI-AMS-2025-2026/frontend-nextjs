import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Gera a saída mínima auto-contida em `.next/standalone`, usada pela imagem Docker.
  output: "standalone",
};

export default nextConfig;
