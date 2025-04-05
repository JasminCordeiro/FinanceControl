# **CSI606-2024-02 - Remoto - Proposta de Trabalho Final**

## *Discente: Jasmin Andrade Cordeiro (22.2.8104)*

# **CSI606-2024-02 - Remoto - Proposta de Trabalho Final**

### Resumo

  Este trabalho tem como objetivo o desenvolvimento de um sistema de **Planejamento Financeiro Pessoal** que visa auxiliar os usuários na organização e acompanhamento de suas finanças de maneira prática e eficiente. A aplicação permitirá o registro, monitoramento e análise de receitas e despesas, fornecendo dados personalizados e ferramentas para melhor gestão financeira.

### 1. Tema

  O trabalho final tem como tema o desenvolvimento de um sistema de **Planejamento Financeiro Pessoal**. O objetivo principal é criar uma aplicação funcional que ajude os usuários a controlar seus gastos, definir orçamentos e visualizar suas finanças de forma detalhada por meio de gráficos e relatórios.

### 2. Escopo

  Este projeto terá as seguintes funcionalidades:
  1. **Cadastro de Usuários**:
     - Criação de contas para cada usuário, com autenticação por login e senha.
  2. **Cadastro de Transações**:
     - Registro de receitas (ex.: salário, bônus) e despesas (ex.: contas, compras).
     - Criação de categorias personalizáveis (ex.: alimentação, transporte, lazer).
  3. **Relatórios e Gráficos**:
     - Exibição de gastos por filtro.
     - Comparação de receitas e despesas em gráficos mensais e anuais.
  4. **Orçamento**:
     - Definição de limites de gastos por categoria.
     - Alertas sobre limites excedidos ou próximos de serem atingidos.
  5. **Histórico de Transações**:
     - Consulta e edição de transações anteriores.
     - Filtros por data, categoria e tipo (receita ou despesa).
     - Exportação de relatórios financeiros em PDF.

### 3. Restrições

  Neste trabalho, não serão considerados:
  - Integração direta com bancos ou plataformas financeiras externas.
  - Suporte a múltiplas moedas ou conversões cambiais.
  - Funcionalidades avançadas de inteligência artificial para análises preditivas.

### 4. Protótipo

  Protótipos para as principais páginas da aplicação foram elaborados e podem ser encontrados no seguinte link do [Figma](https://www.figma.com/design/6L5zIBpaJ9M7Wz28wgwjzM/Untitled?node-id=0-1&t=NLvv0cFWPiLDMLJd-1). As páginas prototipadas incluem:
  - Tela de Login e Cadastro de Usuários.
  - Tela de Dashboard.
  - Tela de Relatórios.
  - Tela de Configuração Despesas + Usuários.

  Esses protótipos foram criados para fornecer uma visão inicial da interface e da experiência do usuário, priorizando a usabilidade e o design intuitivo.  

### 5. Tecnologias Utilizadas

- Angular, como framework principal do frontend;
- Firebase, para autenticação, banco de dados em tempo real e hospedagem;
- Bootstrap 5, para garantir um layout responsivo e moderno;
- SweetAlert2, para exibir mensagens e confirmações interativas;
- Charts.js, para gerar gráficos de gastos e receitas;
- jsPDF e o plugin autoTable, para geração de relatórios em PDF.



# **Resultados**

### 1. Funcionalidades implementadas
  1. **Cadastro de Usuários**:
     - Criação de contas para cada usuário, com autenticação por login e senha.
  2. **Cadastro de Transações**:
     - Registro de receitas (ex.: salário, bônus) e despesas (ex.: contas, compras).
     - Criação de categorias personalizáveis (ex.: alimentação, transporte, lazer).
  3. **Relatórios e Gráficos**:
     - Exibição de gastos por filtro.
     - Comparação de receitas e despesas em gráficos mensais e anuais.
  4. **Orçamento**:
     - Definição de limites de gastos por categoria.
     - Alertas sobre limites excedidos ou próximos de serem atingidos.
  5. **Histórico de Transações**:
     - Consulta e edição de transações anteriores.
     - Filtros por data, categoria e tipo (receita ou despesa).
     - Exportação de relatórios financeiros em PDF.
  
### 2. Funcionalidades previstas e não implementadas
  1. Divisão de despesas por mês (estruturação mais granular por períodos ainda em desenvolvimento).

### 4. Principais desafios e dificuldades
Durante o desenvolvimento do projeto, alguns dos principais desafios enfrentados foram relacionados à configuração e integração com o Firebase. A autenticação de usuários exigiu atenção especial, principalmente no tratamento de estados assíncronos e controle de sessão. Além disso, a estruturação do banco de dados em tempo real para suportar filtros por data e categoria envolveu um aprendizado adicional de regras de segurança e modelagem de dados no Firebase. Outro desafio relevante foi a lógica para geração dinâmica dos gráficos e relatórios, que exigiu tratamento adequado dos dados para garantir precisão e performance. Apesar das dificuldades, todos os obstáculos contribuíram para um aprendizado mais aprofundado sobre as ferramentas utilizadas.

### 5. Instruções para instalação e execução
1. **Clone o repositório**
   git clone https://github.com/JasminCordeiro/FinanceControl.git
2. **Acesse a pasta do projeto**
   cd seu-repositorio
3. **Instale as dependências**
   npm install
4. **Rode a aplicação**
   ng serve




