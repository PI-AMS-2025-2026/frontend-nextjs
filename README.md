# PI-AMS 2025-2026 Frontend Angular

## 🚀 Pré-requisitos

- **Node.js** 18+ 
- **npm** 9+
- **Angular CLI** 17+

```bash
# Verificar versões
node --version
npm --version
ng version
```

## ⚙️ Setup do Projeto Angular

### 1. Criar novo projeto Angular

```bash
# Clonar o repositório
git clone https://github.com/PI-AMS-2025-2026/frontend-angular

# Ter o Angular instaldo na máquina
npm install -g @angular/cli

# Entrar no diretório
cd pi-ams-2025-2026-frontend-angular

# Rodar install do projeto
npm install
```

## 🎨 Migração Bootstrap → Tailwind CSS v4

**⚠️ AVISO IMPORTANTE**: Esta seção contém **exemplos básicos** de migração. Muitos componentes Bootstrap possuem funcionalidades JavaScript embutidas (modais, dropdowns, tooltips, etc.) que precisarão ser **reimplementadas manualmente** em Angular. A migração envolve apenas a parte visual (CSS), não a funcionalidade JavaScript.

### 🔄 Guia de Migração: Classes Bootstrap → Tailwind

#### **Grid System**

| Bootstrap | Tailwind CSS v4 |
|-----------|-----------------|
| `container` | `container mx-auto px-4` |
| `row` | `flex flex-wrap -mx-4` |
| `col-12` | `w-full px-4` |
| `col-md-6` | `md:w-1/2 px-4` |
| `col-lg-4` | `lg:w-1/3 px-4` |

#### **Spacing**

| Bootstrap | Tailwind CSS v4 |
|-----------|-----------------|
| `m-3` | `m-3` |
| `mt-4` | `mt-4` |
| `p-5` | `p-5` |
| `mb-2` | `mb-2` |

#### **Flexbox**

| Bootstrap | Tailwind CSS v4 |
|-----------|-----------------|
| `d-flex` | `flex` |
| `justify-content-center` | `justify-center` |
| `align-items-center` | `items-center` |
| `flex-row` | `flex-row` |
| `flex-column` | `flex-col` |

#### **Buttons**

| Bootstrap | Tailwind CSS v4 |
|-----------|-----------------|
| `btn btn-primary` | `bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors` |
| `btn btn-secondary` | `bg-secondary text-white px-4 py-2 rounded hover:bg-secondary/80 transition-colors` |
| `btn btn-success` | `bg-success text-white px-4 py-2 rounded hover:bg-success/80 transition-colors` |
| `btn btn-danger` | `bg-danger text-white px-4 py-2 rounded hover:bg-danger/80 transition-colors` |

#### **Cards**

| Bootstrap | Tailwind CSS v4 |
|-----------|-----------------|
| `card` | `bg-white border border-gray-200 rounded-lg shadow-sm` |
| `card-body` | `p-6` |
| `card-title` | `text-xl font-semibold mb-2` |
| `card-text` | `text-gray-600` |


#### **Modals**

| Bootstrap | Tailwind CSS v4 |
|-----------|-----------------|
| `modal` | `fixed inset-0 z-50 flex items-center justify-center` |
| `modal-dialog` | `bg-white rounded-lg shadow-xl max-w-md w-full mx-4` |
| `modal-content` | `p-6` |
| `modal-header` | `border-b border-gray-200 pb-4 mb-4` |
| `modal-footer` | `border-t border-gray-200 pt-4 mt-4 flex justify-end space-x-2` |

#### **Navigation**

| Bootstrap | Tailwind CSS v4 |
|-----------|-----------------|
| `navbar` | `bg-white shadow-sm border-b border-gray-200` |
| `navbar-brand` | `text-xl font-bold text-primary` |
| `nav-link` | `text-gray-600 hover:text-primary px-3 py-2 transition-colors` |
| `active` | `text-primary font-medium` |

### 🛠️ Exemplos Práticos

**⚠️ NOTA**: Estes são **exemplos visuais apenas**. Funcionalidades JavaScript como toggle de modais, validação de formulários, dropdowns, etc., precisarão ser implementadas **manualmente** em Angular com TypeScript.

#### **Botão Primário**

```html
<!-- Bootstrap -->
<button class="btn btn-primary">Clique aqui</button>

<!-- Tailwind CSS v4, com estilos diretamente aplicados via classes -->
<button class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200">
  Clique aqui
</button>
```

### 🎯 Componentes Customizados

**⚠️ IMPORTANTE**: Estes componentes são **exemplos de estrutura visual**. Toda a funcionalidade JavaScript (eventos, validações, estados, etc.) precisa ser implementada manualmente em Angular com TypeScript.

Crie/utilize componentes reutilizáveis no projeto:

#### **Exemplo de uso com Material Icons**

```html
<app-button
  variant="primary"
  size="md"
  (buttonClick)="[modal.open(), (isEditing = false)]">
  <mat-icon class="align-middle mr-1" fontIcon="add">add</mat-icon> <!-- Icone do Material Icons -->
  Adicionar
</app-button>
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── modules/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   └── modal/
│   │   │   └── services/
│   │   ├── coordinator/
│   │   └── admin/
│   ├── interfaces/
│   ├── services/
│   ├── app-module.ts
│   ├── app-routing-module.ts
│   └── app.css
├── styles.css
├── main.ts
└── index.html
```

## 🚀 Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
ng s -o

# Iniciar JSON Server (API mock)
json-server db.json --port 8081

# Iniciar Storybook
npm run storybook

```

## 🔗 Links Úteis

### 📚 Documentação Oficial

- **Tailwind CSS v4**: https://tailwindcss.com/docs/v4-beta
- **Angular Documentation**: https://angular.dev/docs
- **Angular Material**: https://material.angular.io/

### 🛠️ Ferramentas

- **Tailwind CSS Play**: https://play.tailwindcss.com/
- **Tailwind CSS IntelliSense**: https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss
- **Angular DevTools**: https://angular.dev/tools/devtools

### 📖 Guias de Migração

**⚠️ ATENÇÃO**: A migração de Bootstrap para Tailwind CSS envolve apenas a parte visual. Componentes Bootstrap com JavaScript embutido precisarão ser completamente reescritos em Angular.

### 🎨 Design Resources

- **Tailwind UI**: https://tailwindui.com/
- **Material Icons**: https://fonts.google.com/icons
