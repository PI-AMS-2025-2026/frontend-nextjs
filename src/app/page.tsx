import { redirect } from 'next/navigation';

/*
 * Este projeto não é dono da navegação/navbar do sistema — isso é
 * responsabilidade de outra parte do time. A rota "/" aqui existe só
 * pra `npm run dev` abrir em algum lugar útil durante o desenvolvimento
 * local; não faz parte de nenhum protótipo.
 */
export default function Home() {
  redirect('/cursos');
}
