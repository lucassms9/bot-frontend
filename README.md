# 📱 Bot de Apostas - Frontend

App Next.js + React para visualizar oportunidades e duplas de apostas do Brasileirão.

## 🚀 Como Rodar

### 1. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O app estará disponível em: **http://localhost:3000**

## 📋 Pré-requisitos

A API backend deve estar rodando também em `http://localhost:3000`:

```bash
# No diretório raiz do projeto (bot-apostas)
npm run start:dev
```

**IMPORTANTE**: Como ambos usam porta 3000, você pode:
- Rodar o Next.js em outra porta: `npm run dev -- -p 3001`
- Configurar o backend em outra porta

## 🎨 Funcionalidades

### ⚽ Tela de Oportunidades
- Lista todas as oportunidades de apostas disponíveis
- Cards coloridos por categoria de risco
- Estrelas indicando qualidade (1-5 ⭐)
- Informações do jogo, handicap e odd
- Refresh manual

### 🎲 Tela de Duplas
- Visualização de duplas de apostas
- Cálculo de odd total e lucro potencial
- Detalhes completos dos 2 jogos
- Filtro por status (todas/pendentes/vencidas/perdidas)
- Indicador de categoria de risco

### 📊 Estatísticas
- Card com resumo geral no topo de cada tela
- Total de oportunidades e duplas
- Win rate das apostas
- Lucro total acumulado

## 🎯 Estrutura do Projeto

```
nextjs-client/
├── app/
│   ├── layout.tsx          # Layout principal com header e tabbar
│   ├── page.tsx            # Redirect para /opportunities
│   ├── opportunities/      # Tela de oportunidades
│   │   └── page.tsx
│   └── bets/               # Tela de duplas
│       └── page.tsx
├── components/
│   ├── TabBar.tsx          # Barra de navegação inferior
│   ├── OpportunityCard.tsx # Card de oportunidade
│   ├── BetCard.tsx         # Card de dupla
│   └── StatsCard.tsx       # Card de estatísticas
├── lib/
│   └── api.ts              # Funções para chamar a API
├── types/
│   └── index.ts            # TypeScript types
└── .env.local              # Configuração da URL da API
```

## 🎨 Design

- **Framework CSS**: Tailwind CSS
- **Ícones**: Heroicons
- **Cores**:
  - Excelente: Verde
  - Ótimo: Azul
  - Bom: Amarelo
  - Moderado: Laranja
  - Alto: Vermelho

## 📱 Navegação

Tabbar fixa no rodapé:
- **Oportunidades** 📋 - Lista de apostas individuais
- **Bets** 🏆 - Duplas recomendadas

## 🔄 Auto-refresh

Use o botão "Atualizar" em cada tela para buscar novos dados da API.

## 🛠️ Troubleshooting

### Erro de conexão com API
1. Verifique se o backend está rodando (`npm run start:dev` no diretório raiz)
2. Confirme a URL em `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3000`
3. Teste a API diretamente: `curl http://localhost:3000/api/opportunities`

### Porta em conflito
```bash
# Rode o Next.js em porta diferente
npm run dev -- -p 3001
```

---

**Desenvolvido para o Bot de Apostas - Handicap Asiático 🚀**
