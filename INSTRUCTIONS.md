### Este projeto utiliza shadcn/ui para construir interfaces de forma rápida, consistente e reutilizável.

Antes de criar um componente do zero, verifique se ele já existe no shadcn/ui.
Sempre que possível, prefira utilizar os componentes disponíveis.

🚀 Adicionando componentes

Para adicionar um componente:

npx shadcn@latest add button

Também é possível adicionar vários de uma vez:

npx shadcn@latest add button card dialog input
🧩 Use os componentes existentes

Antes de implementar algo novo, procure um componente equivalente no shadcn/ui.

Alguns exemplos:

Button
Card
Dialog
Drawer
Sheet
Input
Textarea
Select
Checkbox
Switch
Tabs
Table
Dropdown Menu
Tooltip
Popover
Accordion
Alert Dialog
Form
Calendar
Command

Por exemplo, se precisar de um modal, não crie toda a estrutura e comportamento do zero. Adicione o Dialog:

npx shadcn@latest add dialog
⚡ Regra geral

Ao desenvolver uma nova tela:

Veja quais componentes serão necessários.
Verifique primeiro se eles existem no shadcn/ui.
Adicione os componentes necessários com npx shadcn@latest add.
Reutilize e combine os componentes existentes.
Customize apenas quando necessário.
Crie um componente do zero somente quando não houver uma alternativa adequada.

Isso reduz código duplicado e mantém design, comportamento e acessibilidade consistentes em todo o projeto.

🎨 Customização

Os componentes do shadcn/ui ficam dentro do próprio projeto, então podem ser customizados quando necessário.

Ainda assim, prefira utilizar as variantes e opções já disponíveis antes de modificar o componente ou criar uma nova implementação.

📚 Documentação

Consulte a documentação oficial do shadcn/ui para encontrar os componentes disponíveis e ver como adicioná-los:

https://ui.shadcn.com/docs/components

Resumo: procure no shadcn/ui → reutilize → customize se necessário → crie do zero apenas como última opção.
