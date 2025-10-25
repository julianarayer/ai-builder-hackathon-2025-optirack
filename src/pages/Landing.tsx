/**
 * Landing Page
 * Modern hero section with glassmorphism Apple-style design
 */

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { 
  Clock, 
  Brain, 
  TrendingUp, 
  Upload, 
  Zap, 
  BarChart3, 
  CheckCircle,
  ArrowRight,
  Warehouse
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import warehouseHero from "@/assets/warehouse-hero.png";

export default function Landing() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Clock,
      title: "15-40% Menos Tempo",
      description: "Redução comprovada no tempo de picking",
    },
    {
      icon: Brain,
      title: "IA Identifica Padrões",
      description: "Detecta produtos frequentemente pedidos juntos",
    },
    {
      icon: TrendingUp,
      title: "ROI em 3-6 Meses",
      description: "Retorno rápido do investimento",
    },
  ];

  const steps = [
    { icon: Upload, title: "Upload de Dados", subtitle: "Envie seu histórico de pedidos" },
    { icon: Zap, title: "Análise Automática", subtitle: "IA processa em segundos" },
    { icon: BarChart3, title: "Insights Visuais", subtitle: "Visualize oportunidades" },
    { icon: CheckCircle, title: "Aplicar Recomendações", subtitle: "Implementação guiada" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50">
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(
            to right,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(255, 255, 255, 0.95) 20%,
            rgba(255, 255, 255, 0.85) 35%,
            rgba(255, 255, 255, 0.60) 50%,
            rgba(255, 255, 255, 0.30) 70%,
            rgba(255, 255, 255, 0.10) 85%,
            rgba(255, 255, 255, 0) 100%
          ),
          linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 60%,
            rgba(255, 255, 255, 0.3) 75%,
            rgba(255, 255, 255, 0.6) 85%,
            rgba(255, 255, 255, 0.9) 95%,
            rgba(255, 255, 255, 1) 100%
          ),
          url(${warehouseHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2 bg-white/90 backdrop-blur-md">
              <div className="h-2 w-2 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-sm font-medium text-neutral-700">
                O futuro do armazenamento é inteligente - é OptiRack
              </span>
            </div>
            
            <h1 className="text-5xl font-bold leading-tight lg:text-6xl" style={{ textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}>
              <span className="bg-gradient-to-r from-primary-300 to-primary-400 bg-clip-text text-transparent" style={{ textShadow: 'none' }}>
                Otimize seu armazém
              </span>
              <br />
              <span className="text-neutral-900">com Inteligência Artificial</span>
            </h1>
            
            <p className="text-xl text-neutral-600 max-w-2xl" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
              Menos caminho, mais entrega. Reorganize SKUs com base em dados reais com recomendações inteligentes - Análise ABC, afinidade de produtos e otimização de rotas em um só lugar.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <Button 
                size="lg" 
                className="group"
                onClick={() => navigate('/login')}
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/80 backdrop-blur-sm">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative container mx-auto px-4 py-20">
        {/* Gradient overlay for smooth transition */}
        <div 
          className="absolute inset-x-0 top-0 h-32 -mt-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)'
          }}
        />
        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <GlassCard 
              key={index} 
              hover 
              className="flex flex-col items-center text-center p-8 gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                <benefit.icon className="h-8 w-8 text-primary-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">
                {benefit.title}
              </h3>
              <p className="text-neutral-600">
                {benefit.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            Como Funciona
          </h2>
          <p className="text-xl text-neutral-600">
            Quatro passos simples para otimizar seu armazém
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-[72px] left-[12.5%] right-[12.5%] h-[2px] border-t-2 border-dashed border-primary-300" />
          
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center gap-4 animate-fade-in relative z-10"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex h-36 w-36 items-center justify-center rounded-3xl glass-card bg-white/90 relative">
                <div className="absolute -top-3 -right-3 h-12 w-12 rounded-2xl bg-primary-200 flex items-center justify-center font-bold text-neutral-900 text-xl">
                  {index + 1}
                </div>
                <step.icon className="h-12 w-12 text-primary-400" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-neutral-600">
                  {step.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <GlassCard className="text-center p-12 space-y-6 bg-gradient-to-br from-primary-100/50 to-primary-200/30">
          <h2 className="text-4xl font-bold text-neutral-900">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já otimizaram suas operações com OptiRack
          </p>
          <Button 
            size="lg" 
            className="group"
            onClick={() => navigate('/login')}
          >
            Começar Agora
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Warehouse className="h-6 w-6 text-primary-400" />
              <span className="font-semibold text-neutral-900">OptiRack AI</span>
            </div>
            <p className="text-sm text-neutral-600">
              © 2025 OptiRack. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-neutral-600">
              <button className="hover:text-primary-500 transition-smooth">Sobre</button>
              <button className="hover:text-primary-500 transition-smooth">Contato</button>
              <button className="hover:text-primary-500 transition-smooth">Docs</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
