# OptiRack 🛺 🩷

**plataforma de análise inteligente para gestão de SKUs**
Reorganize SKUs com base em dados reais utilizando recomendações inteligentes: análise ABC, afinidade de produtos e otimização de rotas em um só lugar.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-blueviolet?style=for-the-badge)](https://lovable.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-97.4%25-blue?style=for-the-badge\&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-Framework-61DAFB?style=for-the-badge\&logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**demo**: [https://lovable.dev/projects/c09446f5-1278-4dd8-98f2-f04abb8abc87](https://lovable.dev/projects/c09446f5-1278-4dd8-98f2-f04abb8abc87)
**documentação rápida**: [como usar](#como-usar) • [arquitetura](#arquitetura) • [roadmap](#roadmap)

---

## por que existe?

empresas de trade marketing lidam com bases heterogêneas (cada cliente manda um csv diferente), planilhas manuais, retrabalho e pouca escalabilidade. o **OptiRack** automatiza o mapeamento, padronização de SKUs, checagens de qualidade e geração de gráficos: tudo em uma UI responsiva e amigável.

---

## principais recursos

* **mapeamento automático com IA**
  identifica campos tipo `produto`, `sku`, `quantidade`, `data` mesmo com nomes desalinhados, e aprende com cada upload.

* **qualidade de dados (IQD) e métricas operacionais**
  cobertura de campos, nulos, outliers, eficiência por segmento/operador, coeficiente de variação e comparações históricas.

* **dashboards interativos**
  funcionalidades que envolvem período/segmento, fácil visualização.

* **multi-cliente, multi-projeto**
  autenticação, histórico de uploads e trilha para auditoria do cliente.

* **stack moderna**
  React + TypeScript + Tailwind + shadcn/ui no front; Supabase (auth/db/storage) + Gemini API KEY para IA + Perplexity PRO (mapeamento) no back.

---

## estrutura

### pré-requisitos

* Node.js 18+
* npm ou yarn
* contas/chaves de **Supabase** e **Google Gemini**

### instalação

```bash
git clone https://github.com/julianarayer/ai-builder-hackathon-2025-optirack.git
cd ai-builder-hackathon-2025-optirack
npm install
```

crie `.env` na raiz:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

rodar:

```bash
npm run dev
# abra http://localhost:5173
```

scripts úteis:

```bash
npm run build     # build de produção
npm run preview   # pré-visualização do build
npm run lint      # checagens estáticas
```

---

## como usar

1. **upload**
   faça login → “novo upload” → arraste o csv.
2. **mapeamento**
   a IA sugere correspondências de colunas; revise/ajuste se quiser.
3. **análise**
   IQD, eficiência, tendências e distribuição temporal.
4. **visualização**
   dashboards com filtros e exportação para pdf.
5. **api**

```js
const res = await fetch('https://api.optirack.com/analyze', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ file_url: 'https://storage.example.com/data.csv', analysis_type: 'full' })
});
const data = await res.json();
```

---

## arquitetura

```
┌───────────────────────────┐
│        react + vite       │  ui (tailwind + shadcn/ui)
└───────────────┬───────────┘
                │
        ┌───────▼────────┐
        │    supabase    │  auth + db + storage (postgres)
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │   gemini api   │  mapeamento inteligente de colunas
        └────────────────┘
```

**fluxo**: upload → storage → IA identifica e normaliza colunas → cálculo de IQD/KPIs → dashboards → aprendizado contínuo (feedback loop).

---

## tecnologias

* **frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
* **backend/serviços**: Supabase (auth/db/storage), PostgreSQL, Google Gemini API
* **devops/deploy**: GitHub, Lovable

---

## roadmap

**fase 1 — mvp**

* upload csv • mapeamento básico • IQD • dashboard • ui glassmorphism

**fase 2 — em desenvolvimento**

* suporte excel/json/api • predições • alertas de anomalia • mapeamento mais robusto

**fase 3 — futuro**

* integrações com ERPs • app mobile • visão de gôndola (imagens) • recomendações automáticas • marketplace de análises

---

## boas práticas de dados

* anonimizar PII nos uploads (onde aplicável)
* versionar dicionários de dados e regras de mapeamento
* registrar exceções de parsing para auditoria


---

## produção

**juliana rayer** — ai builder

---




