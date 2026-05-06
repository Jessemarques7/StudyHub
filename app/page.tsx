// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  FilePenLine,
  Focus,
  Network,
  PlayCircle,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";

const heroImageUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAgngT-t95uWdka9cA3DB1DybXuU-weNs5AAF9-bhF7l5z3RV5L4ld5gUy85UptvN4C-etNlwOsDeEw7ITSyXSVI5DI2qIZY43Sp1VOp2R1du_0RJdatbMqYuv_hMHWmcHTpy8QX74pE5DG8_8j_reFbO1QiMIsXf2sn4Weh-DPldwAB04Jv7PBkCecz7kz2sJRGbfOPgBUNTucvUktPIFArbWxsXL2gzqGNqc5BKDzpTqdN24jyk6r-K9VZab2bkaZoEPbLA9OrNL3";

const headingClass =
  "[font-family:var(--font-lexend),ui-sans-serif,system-ui,sans-serif] font-semibold";

const features = [
  {
    title: "Assistente de IA",
    description:
      "Capaz de gerar resumos, explicações, flashcards e planos de estudo personalizados.",
    icon: Bot,
  },
  {
    title: "Visão em Grafo",
    description:
      "Visualize conexões entre diferentes disciplinas e tópicos de forma intuitiva.",
    icon: Network,
    accent: true,
  },
  {
    title: "Espaço de Foco",
    description:
      "Um ambiente de trabalho livre de distrações projetado para sessões de estudo profundo.",
    icon: Focus,
  },
];

const compactTools = [
  {
    title: "Rastreador de Hábitos",
    description: "Construa consistência nos estudos com acompanhamento diário.",
    icon: Target,
    href: "/habits",
  },
  {
    title: "Tarefas e Metas",
    description:
      "Defina objetivos acadêmicos e acompanhe a conclusão passo a passo.",
    icon: CheckCircle2,
    href: "/notes",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#131313] text-[#e4e2e1] antialiased [font-family:var(--font-inter),ui-sans-serif,system-ui,sans-serif]">
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#131313]/80 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-6 md:px-12">
          <Link
            href="/"
            className={`${headingClass} text-xl font-bold text-[#d1bcff]`}
          >
            Study Hub
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-[#cbc3d5] transition-colors hover:text-[#d1bcff] md:inline"
            >
              Log In
            </Link>
            <Link
              href="/notes"
              className="inline-flex h-9 items-center justify-center rounded-full bg-[#d1bcff] px-5 text-xs font-semibold text-[#3d018f] shadow-[0_0_15px_rgba(209,188,255,0.22)] transition-all hover:bg-[#a882ff] active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative mx-auto max-w-[1280px] overflow-hidden px-6 pb-24 pt-16 md:px-12 md:pt-24">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[linear-gradient(115deg,rgba(209,188,255,0.12),transparent_38%,rgba(168,130,255,0.08)_72%,transparent)]" />

          <div className="relative grid items-center gap-12 md:grid-cols-2">
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d1bcff]/20 bg-[#d1bcff]/10 px-3 py-1 text-xs font-semibold text-[#d1bcff]">
                <Sparkles className="size-3.5 fill-[#d1bcff]" />
                Plataforma de Alta Performance
              </span>

              <h1
                className={`${headingClass} max-w-2xl text-4xl leading-[1.14] text-[#f4f0f7] sm:text-5xl lg:text-[56px]`}
              >
                Domine seu Futuro com o{" "}
                <span className="bg-gradient-to-br from-[#d1bcff] to-[#a882ff] bg-clip-text text-transparent">
                  Study Hub
                </span>
              </h1>

              <p className="max-w-xl text-base leading-7 text-[#cbc3d5] md:text-lg">
                A plataforma definitiva para estudantes que buscam excelência
                acadêmica e profissional. Minimize distrações, maximize
                resultados.
              </p>

              <div className="flex w-full flex-col gap-4 pt-2 sm:w-auto sm:flex-row">
                <Link
                  href="/notes"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#d1bcff] px-8 text-sm font-semibold text-[#3d018f] shadow-[0_0_20px_rgba(209,188,255,0.32)] transition-all hover:bg-[#a882ff] hover:shadow-[0_0_30px_rgba(209,188,255,0.44)] active:scale-95"
                >
                  Começar Agora
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="#tools"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-8 text-sm font-semibold text-[#e4e2e1] backdrop-blur-xl transition-colors hover:text-[#d1bcff]"
                >
                  <PlayCircle className="size-4" />
                  Ver Demo
                </Link>
              </div>
            </div>

            <div className="relative min-h-[400px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-2 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl md:min-h-[600px]">
              <div className="absolute inset-2 overflow-hidden rounded-md">
                <Image
                  src={heroImageUrl}
                  alt="Espaço moderno de estudos com laptop, tablet e iluminação roxa suave."
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover opacity-90"
                />
              </div>
              <div className="absolute inset-x-6 bottom-6 rounded-lg border border-white/10 bg-[#242424]/60 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#e4e2e1]">
                      Progresso Diário
                    </p>
                    <p className={`${headingClass} text-2xl text-[#d1bcff]`}>
                      85%
                    </p>
                  </div>
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-[#393939] sm:w-36">
                    <div className="h-full w-[85%] rounded-full bg-[#d1bcff] shadow-[0_0_10px_#d1bcff]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.05] bg-[#1f2020]/30 py-24">
          <div className="mx-auto max-w-[1280px] px-6 md:px-12">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2
                className={`${headingClass} mb-4 text-3xl text-[#f4f0f7] md:text-4xl`}
              >
                Arquitetura para o Sucesso
              </h2>
              <p className="text-base leading-7 text-[#cbc3d5] md:text-lg">
                Tudo que você precisa para uma jornada de estudos impecável,
                integrado em uma única interface fluida.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#d1bcff] hover:shadow-[0_0_20px_rgba(209,188,255,0.24)]"
                  >
                    {feature.accent ? (
                      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#d1bcff]/5 to-transparent" />
                    ) : null}
                    <div className="mb-6 flex size-14 items-center justify-center rounded-lg border border-[#d1bcff]/20 bg-[#d1bcff]/10 text-[#d1bcff]">
                      <Icon className="size-7" />
                    </div>
                    <h3
                      className={`${headingClass} mb-3 text-2xl text-[#f4f0f7]`}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-base leading-6 text-[#cbc3d5]">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="tools"
          className="mx-auto max-w-[1280px] px-6 py-24 md:px-12"
        >
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2
                className={`${headingClass} mb-2 text-3xl text-[#f4f0f7] md:text-4xl`}
              >
                Seu Arsenal de Estudos
              </h2>
              <p className="text-base leading-7 text-[#cbc3d5] md:text-lg">
                Módulos projetados com a estética glassmorfica para foco total.
              </p>
            </div>
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#d1bcff] transition-colors hover:text-[#a882ff]"
            >
              Explorar todas as ferramentas
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-4 md:grid-rows-2 md:[grid-auto-rows:minmax(0,1fr)]">
            <Link
              href="/calendar"
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition-all hover:border-[#d1bcff]/70 md:col-span-2 md:row-span-2 md:min-h-[600px]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#d1bcff]/5 to-transparent" />
              <div className="relative flex h-full flex-col">
                <span className="mb-4 w-fit rounded-full border border-white/10 bg-[#2a2a2a] px-3 py-1 text-xs font-semibold text-[#e4e2e1]">
                  Destaque
                </span>
                <CalendarDays className="mb-5 size-10 text-[#d1bcff]" />
                <h3
                  className={`${headingClass} mb-2 text-2xl text-[#f4f0f7]`}
                >
                  Calendário Inteligente
                </h3>
                <p className="mb-6 flex-1 text-base leading-6 text-[#cbc3d5]">
                  Gerencie sua rotina, defina prazos e otimize seu tempo de
                  forma inteligente. Mantenha tudo organizado em um único lugar
                  para maior produtividade.
                </p>

                <div className="rounded-lg border border-white/[0.06] bg-[#1f2020]/50 p-4 shadow-inner">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-[#e4e2e1]">
                      Próximos Eventos
                    </span>
                    <span className="text-xs font-semibold text-[#d1bcff]">
                      Atualizado
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex min-h-8 items-center rounded border-l-2 border-[#d1bcff] bg-[#353535] px-3">
                      <span className="text-xs text-[#cbc3d5]">
                        Prova de Cálculo III - Amanhã, 10:00
                      </span>
                    </div>
                    <div className="flex min-h-8 items-center rounded border-l-2 border-[#c5c7c8] bg-[#353535] px-3">
                      <span className="text-xs text-[#cbc3d5]">
                        Entrega de TCC - Sexta, 23:59
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href="/notes"
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all hover:border-[#d1bcff]/70 md:col-span-2"
            >
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#d1bcff]/10 to-transparent transition-all duration-500 group-hover:from-[#d1bcff]/15" />
              <div className="relative flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-[#2a2a2a] text-[#d1bcff]">
                  <FilePenLine className="size-6" />
                </div>
                <div>
                  <h3
                    className={`${headingClass} mb-2 text-xl text-[#f4f0f7]`}
                  >
                    Editor de Notas Inteligente
                  </h3>
                  <p className="text-sm leading-6 text-[#cbc3d5]">
                    Um editor poderoso para anotações de estudo incrivelmente
                    organizadas e ricas em contexto.
                  </p>
                </div>
              </div>
            </Link>

            {compactTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="group flex min-h-[220px] flex-col justify-between rounded-lg border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all hover:border-[#d1bcff]/70"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.06] bg-[#2a2a2a] text-[#d1bcff]">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3
                      className={`${headingClass} mb-1 text-xl text-[#f4f0f7]`}
                    >
                      {tool.title}
                    </h3>
                    <p className="text-xs leading-5 text-[#cbc3d5]">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-[#131313] to-[#1f2020]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-full max-w-5xl bg-[linear-gradient(90deg,transparent,rgba(209,188,255,0.08),transparent)]" />

          <div className="relative mx-auto max-w-3xl px-6">
            <div className="rounded-lg border border-[#d1bcff]/20 bg-white/[0.04] p-8 text-center backdrop-blur-xl md:p-12">
              <Rocket className="mx-auto mb-6 size-12 text-[#d1bcff]" />
              <h2
                className={`${headingClass} mb-6 text-3xl leading-tight text-[#f4f0f7] md:text-5xl`}
              >
                Pronto para transformar sua rotina?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-[#cbc3d5] md:text-lg">
                Junte-se a milhares de estudantes que já elevaram seu potencial
                com o Study Hub. A primeira semana é por nossa conta.
              </p>
              <Link
                href="/notes"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#d1bcff] px-8 text-sm font-semibold text-[#3d018f] shadow-[0_0_20px_rgba(209,188,255,0.36)] transition-all hover:bg-[#a882ff] hover:shadow-[0_0_40px_rgba(209,188,255,0.5)] active:scale-95 md:px-10"
              >
                Iniciar Período Gratuito
                <ArrowRight className="size-4" />
              </Link>
              <p className="mt-4 text-xs leading-5 text-[#cbc3d5]">
                Sem compromisso. Cancele quando quiser.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.05] bg-[#2a2a2a] py-8">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-6 md:flex-row md:px-12">
          <Link
            href="/"
            className={`${headingClass} text-xl font-bold text-[#d1bcff]`}
          >
            Study Hub
          </Link>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#cbc3d5]">
            <Link className="transition-colors hover:text-[#d1bcff]" href="#">
              Privacy Policy
            </Link>
            <Link className="transition-colors hover:text-[#d1bcff]" href="#">
              Terms of Service
            </Link>
            <Link className="transition-colors hover:text-[#d1bcff]" href="#">
              Help Center
            </Link>
            <Link className="transition-colors hover:text-[#d1bcff]" href="#">
              Contact Us
            </Link>
          </div>
          <p className="text-xs text-[#cbc3d5]">
            © {new Date().getFullYear()} Study Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
