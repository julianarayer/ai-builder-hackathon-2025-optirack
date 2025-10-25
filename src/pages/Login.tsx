/**
 * Login/Signup Page
 * Unified authentication with Supabase
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Warehouse, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import optirackLogo from "@/assets/optirack-logo.png";
import { toast } from "sonner";

type AuthMode = 'login' | 'signup';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return false;
    }

    if (mode === 'signup') {
      if (!formData.name) {
        toast.error('Informe seu nome completo');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('As senhas não coincidem');
        return false;
      }
      if (formData.password.length < 6) {
        toast.error('A senha deve ter no mínimo 6 caracteres');
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          toast.success('Login realizado com sucesso!');
          navigate('/dashboard');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;

        if (data.user) {
          toast.success('Conta criada com sucesso! Verifique seu email.');
          setMode('login');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos');
      } else if (error.message.includes('User already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error(error.message || 'Erro ao processar autenticação');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-primary-50/30 to-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo/Brand */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="glass-card p-4 rounded-3xl">
              <img src={optirackLogo} alt="OptiRack Logo" className="h-16 w-16 object-contain" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold gradient-text">OptiRack AI</h2>
            <p className="text-neutral-600 mt-2">
              {mode === 'login' 
                ? 'Acesse sua conta' 
                : 'Crie sua conta gratuita'
              }
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <GlassCard className="p-8">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 glass-card bg-neutral-100/50 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-smooth ${
                mode === 'login'
                  ? 'bg-primary-200 text-neutral-900 shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-smooth ${
                mode === 'signup'
                  ? 'bg-primary-200 text-neutral-900 shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-neutral-700">
                  Nome Completo
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seuemail@empresa.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-smooth"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
                  Confirmar Senha
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : mode === 'login' ? (
                'Entrar'
              ) : (
                'Criar Conta'
              )}
            </Button>

            {mode === 'login' && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary-500 hover:text-primary-600 transition-smooth"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}
          </form>
        </GlassCard>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-neutral-600 hover:text-primary-500 transition-smooth"
          >
            ← Voltar para Home
          </button>
        </div>
      </div>
    </div>
  );
}
