import { HorariosListagem } from "@/components/horarios/horarios-listagem";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <HorariosListagem />
    </div>
  );
}