"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  FileText,
  Layers,
  Share2,
  Sparkles,
  Zap,
  Github,
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  // Variáveis de animação para o container e itens
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20 flex flex-col">
      {/* Background Gradients Ambientais */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-6 h-20 flex items-center justify-between border-b border-border/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-primary/10  flex items-center justify-center text-primary shadow-glow">
            <Image alt="logo" width={50} height={50} src={"/logo.png"} />
          </div>
          StudyHub
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Login
          </Link>
          <Link
            href="/notes"
            className="hidden sm:inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
          >
            Acessar App
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 container mx-auto px-6 pt-20 pb-32 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-md"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5 fill-primary" />
              Sua central de estudos definitiva
            </motion.div>

            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Estude de forma mais <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-500 animate-gradient bg-300%">
                inteligente
              </span>
              , não mais difícil.
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Combine anotações poderosas, flashcards com repetição espaçada e
              diagramas visuais em uma única plataforma fluida e moderna.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/notes"
                className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
              >
                Começar Agora <ArrowRight size={18} />
              </Link>
              <Link
                href="https://github.com/jessemarques7/studyhub"
                target="_blank"
                className="h-12 px-8 rounded-full border border-border bg-background/50 backdrop-blur-sm hover:bg-muted/50 text-foreground font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group"
              >
                <Github
                  size={18}
                  className="text-muted-foreground group-hover:text-foreground transition-colors"
                />
                GitHub
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6 max-w-6xl w-full mx-auto"
        >
          {/* Card 1: Notes */}
          <Link href="/notes" className="group block h-full">
            <motion.div
              variants={item}
              className="h-full p-8 rounded-3xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-glow hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 rotate-12">
                <FileText size={200} />
              </div>

              <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                <FileText size={28} />
              </div>

              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                Anotações
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Editor rico com suporte a Markdown. Organize seus pensamentos em
                documentos estruturados.
              </p>

              <div className="flex items-center text-sm font-bold text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                Ir para Notas{" "}
                <ArrowRight
                  size={16}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </motion.div>
          </Link>

          {/* Card 2: Flashcards */}
          <Link href="/flashcards" className="group block h-full">
            <motion.div
              variants={item}
              className="h-full p-8 rounded-3xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-glow hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 rotate-12">
                <Layers size={200} />
              </div>

              <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all duration-300">
                <Layers size={28} />
              </div>

              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                Flashcards
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Memorize qualquer coisa com repetição espaçada. Crie baralhos e
                revise diariamente.
              </p>

              <div className="flex items-center text-sm font-bold text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                Praticar Agora{" "}
                <ArrowRight
                  size={16}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </motion.div>
          </Link>

          {/* Card 3: Diagrams */}
          <Link href="/diagram" className="group block h-full">
            <motion.div
              variants={item}
              className="h-full p-8 rounded-3xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-glow hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 rotate-12">
                <Share2 size={200} />
              </div>

              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                <Share2 size={28} />
              </div>

              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                Diagramas
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Mapas mentais e fluxogramas infinitos para visualizar conexões
                complexas.
              </p>

              <div className="flex items-center text-sm font-bold text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                Visualizar{" "}
                <ArrowRight
                  size={16}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} StudyHub. Construído para aprendizado
          contínuo.
        </p>
      </footer>
    </div>
  );
}
