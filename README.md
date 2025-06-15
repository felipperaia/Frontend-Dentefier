# Dentefier - Sistema de Gerenciamento de Casos Odontolegais

![Logo Dentefier](images/logo_dentefier.png)

## Descrição do Projeto

O Dentefier é uma plataforma web completa para gerenciamento de casos odontolegais, desenvolvida para peritos, assistentes e administradores do setor de perícias odontológicas. O sistema permite o cadastro, acompanhamento e geração de relatórios de casos periciais com foco em identificação humana e análise odontolegal.

## Funcionalidades Principais

- **Autenticação Segura**: Sistema de login com diferentes níveis de acesso (admin, perito, assistente)
- **Gerenciamento de Casos**:
  - Cadastro completo de casos com múltiplas seções (identificação, dados do caso, localização)
  - Acompanhamento de status (Em andamento, Finalizado, Arquivado)
  - Visualização detalhada de casos com evidências anexadas
- **Gestão de Evidências**:
  - Upload de imagens e documentos
  - Organização por tipo e data de coleta
  - Visualização prévia de evidências
- **Relatórios Profissionais**:
  - Geração automática de laudos periciais
  - Exportação para PDF
  - Impressão direta de relatórios
- **Dashboard Analítico**:
  - Gráficos de distribuição de casos
  - Estatísticas por status e tipo de caso
  - Visão geral de casos recentes
- **Acessibilidade**:
  - Modo de alto contraste
  - Controle de tamanho da fonte
  - Navegação otimizada

## Tecnologias Utilizadas

### Frontend
- **HTML5** semântico com foco em acessibilidade
- **CSS3** com variáveis para temas e estilos responsivos
- **JavaScript Vanilla** (ES6+) para lógica de aplicação
- **Chart.js** para visualização de dados
- **html2canvas** e **jsPDF** para geração de relatórios em PDF
- **Service Workers** para funcionalidade PWA (offline)

### Backend (Integração)
- API RESTful hospedada em Render.com
- Autenticação via JWT (HTTP-only cookies)
- Armazenamento em nuvem para evidências

## Pré-requisitos

Para executar o projeto localmente:

1. Navegador moderno (Chrome, Firefox, Edge)
2. Conexão com internet (para acesso à API)
3. Node.js (opcional para servidor local)

## Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dentefier-frontend.git
cd dentefier-frontend

# Instale as dependências (se usar servidor local)
npm install -g live-server

# Inicie o servidor local
live-server
```

O aplicativo estará disponível em: `http://localhost:8080`

## Estrutura de Diretórios

```
dentefier-frontend/
├── css/                     # Folhas de estilo
│   ├── cadastro_casounico.css
│   ├── detcaso.css
│   ├── gerenciar_casos.css
│   ├── gerenciar_usuario.css
│   ├── Pindex.css
│   ├── Plogout.css
│   ├── relatorio.css
│   ├── styles.css            # Estilos globais
│   └── tela_inicio.css
├── images/                  # Assets visuais
│   ├── icon-contrast.png
│   ├── icon-font-decrease.png
│   ├── icon-font-increase.png
│   ├── imprimir.png
│   ├── logo_dentefier.png
│   ├── pdf.png
│   └── placeholder-image.png
├── js/                      # Lógica da aplicação
│   ├── cadastro_casounico.js
│   ├── cadastro_usuario.js
│   ├── detalhes_caso.js
│   ├── detalhes_usuario.js
│   ├── editar_evidencia.js
│   ├── editar_usuario.js
│   ├── evidencia.js
│   ├── gerenciar_casos.js
│   ├── gerenciar_usuario.js
│   ├── main.js               # Ponto de entrada
│   ├── logout.js
│   ├── relatorio.js
│   ├── service-worker.js     # PWA
│   └── tela_inicio.js        # Dashboard
├── index.html                # Página de login
├── tela_inicio.html          # Dashboard principal
├── gerenciar_casos.html      # Gestão de casos
├── gerenciar_usuario.html    # Gestão de usuários
├── cadastro_usuario.html     # Formulário de usuário
├── cadastro_casounico.html   # Formulário de caso
├── evidencia.html            # Formulário de evidência
├── detalhes_caso.html        # Detalhes de caso
├── detalhes_usuario.html     # Detalhes de usuário
├── editar_evidencia.html     # Edição de evidência
├── editar_usuario.html       # Edição de usuário
├── relatorio.html            # Relatório em PDF
├── logout.html               # Página de logout
└── manifest.json             # Configuração PWA
```

## Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

**Dentefier** © 2025 - Sistema de Gerenciamento de Casos Odontolegais
