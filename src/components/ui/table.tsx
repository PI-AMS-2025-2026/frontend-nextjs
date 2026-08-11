"use client"

import * as React from "react"
import { Wrench, Pencil, Trash2 } from "lucide-react"

interface Room {
  codigo: string
  capacidade: number
  tipo: string
}

const rooms: Room[] = [
  {
    codigo: "Sala 01",
    capacidade: 40,
    tipo: "Informática",
  },
  {
    codigo: "Sala 02",
    capacidade: 40,
    tipo: "Sala de aula",
  },
  {
    codigo: "Sala 03",
    capacidade: 40,
    tipo: "Informática",
  },
  {
    codigo: "Sala 04",
    capacidade: 40,
    tipo: "Sala de aula",
  },
  {
    codigo: "Sala 05",
    capacidade: 40,
    tipo: "Informática",
  },
  {
    codigo: "Sala 06",
    capacidade: 40,
    tipo: "Sala de aula",
  },
]

export function RoomTable() {
  return (
    <div className="w-full overflow-hidden rounded-[10px] border border-[#C8CDD2]">
      <table className="w-full border-collapse">
        {/* Cabeçalho */}
        <thead>
          <tr className="h-[51px] bg-[#0099AA] text-white">
            <th className="px-6 text-left text-[16px] font-semibold">
              Código
            </th>

            <th className="px-6 text-left text-[16px] font-semibold">
              Capacidade
            </th>

            <th className="px-6 text-left text-[16px] font-semibold">
              Tipo
            </th>

            <th className="px-6 text-right text-[16px] font-semibold">
              Ações
            </th>
          </tr>
        </thead>

        {/* Corpo */}
        <tbody>
          {rooms.map((room, index) => (
            <tr
              key={room.codigo}
              className={`h-[46px] border-b border-[#D0D4D8] ${index % 2 === 0
                  ? "bg-white"
                  : "bg-[#F0F0F0]"
                }`}
            >
              <td className="px-6 text-[16px] text-[#171717]">
                {room.codigo}
              </td>

              <td className="px-6 text-[16px] text-[#171717]">
                {room.capacidade}
              </td>

              <td className="px-6 text-[16px] text-[#171717]">
                {room.tipo}
              </td>

              <td className="px-6">
                <div className="flex justify-end gap-2">
                  {/* Configurar */}
                  <button
                    type="button"
                    aria-label={`Configurar ${room.codigo}`}
                    className="flex size-[34px] items-center justify-center rounded-[7px] border border-[#D0D4D8] bg-white text-[#0099AA] transition-colors hover:bg-[#0099AA]/10"
                  >
                    <Wrench
                      className="size-[22px]"
                      strokeWidth={2}
                    />
                  </button>

                  {/* Editar */}
                  <button
                    type="button"
                    aria-label={`Editar ${room.codigo}`}
                    className="flex size-[34px] items-center justify-center rounded-[7px] border border-[#D0D4D8] bg-white text-[#0099AA] transition-colors hover:bg-[#0099AA]/10"
                  >
                    <Pencil
                      className="size-[21px]"
                      strokeWidth={2}
                    />
                  </button>

                  {/* Excluir */}
                  <button
                    type="button"
                    aria-label={`Excluir ${room.codigo}`}
                    className="flex size-[34px] items-center justify-center rounded-[7px] border border-[#D0D4D8] bg-white text-[#FF0000] transition-colors hover:bg-red-50"
                  >
                    <Trash2
                      className="size-[21px]"
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}