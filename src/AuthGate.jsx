import { useEffect, useRef, useState } from 'react';
import { supabase } from './lib/supabase';
import { LogIn, UserPlus, LogOut, Sparkles } from 'lucide-react';
import './auth.css';

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId || session || loading) return;

    let cancelled = false;

    const renderGoogleButton = () => {
      if (
        cancelled ||
        !window.google?.accounts?.id ||
        !googleButtonRef.current
      ) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential) {
            setError(
              'O Google não retornou uma credencial válida. Tente novamente.'
            );
            return;
          }

          setBusy(true);
          setError('');
          setMessage('');

          try {
            const { data, error: googleError } =
              await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
              });

            if (googleError) throw googleError;
            setSession(data.session);
          } catch (err) {
            setError(
              err.message ||
                'Não foi possível entrar com o Google. Tente novamente.'
            );
          } finally {
            setBusy(false);
          }
        },
      });

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: Math.min(320, googleButtonRef.current.clientWidth || 320),
        logo_alignment: 'left',
        locale: 'pt-BR',
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      let script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener('load', renderGoogleButton);
      if (script.dataset.loaded === 'true') renderGoogleButton();
      script.addEventListener('error', () => {
        if (!cancelled) {
          setError(
            'Não foi possível carregar o login do Google. Verifique sua conexão.'
          );
        }
      });

      if (window.google?.accounts?.id) renderGoogleButton();
    }

    return () => {
      cancelled = true;
    };
  }, [googleClientId, session, loading]);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;

      if (sessionError) {
        setError('Não foi possível verificar sua sessão.');
      } else {
        setSession(data.session);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim() || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }

    if (mode === 'signup' && !username.trim()) {
      setError('Digite um nome de usuário.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setBusy(true);

    try {
      if (mode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        });

        if (signupError) throw signupError;

        if (data.session) {
          setSession(data.session);
        } else {
          setMessage(
            'Cadastro criado! Confira sua caixa de entrada para confirmar o e-mail antes de entrar.'
          );
          setMode('login');
          setPassword('');
        }
      } else {
        const { data, error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (loginError) throw loginError;

        setSession(data.session);
      }
    } catch (err) {
      setError(
        err.message || 'Não foi possível concluir a operação. Tente novamente.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setError('');
    const { error: signoutError } = await supabase.auth.signOut();

    if (signoutError) {
      setError('Não foi possível sair da conta. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-brand-icon">V</div>
        <strong>VICO HUB</strong>
        <span>Carregando sua conta...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-icon">V</div>
            <div>
              <h1>VICO HUB</h1>
              <span>CREATOR PLATFORM</span>
            </div>
          </div>

          <div className="auth-heading">
            <span className="auth-sparkle">
              <Sparkles size={20} />
            </span>
            <h2>
              {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </h2>
            <p>
              {mode === 'login'
                ? 'Entre para acessar seu centro de criação.'
                : 'Comece a organizar seu universo de conteúdo.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <label>
                Nome de usuário
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Como você quer ser chamado?"
                  autoComplete="username"
                  required
                />
              </label>
            )}

            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                minLength={6}
                required
              />
            </label>

            {error && <div className="auth-message auth-error">{error}</div>}
            {message && (
              <div className="auth-message auth-success">{message}</div>
            )}

            <button className="auth-submit" type="submit" disabled={busy}>
              {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
              {busy
                ? 'Aguarde...'
                : mode === 'login'
                ? 'Entrar na conta'
                : 'Criar minha conta'}
            </button>
          </form>

          <div className="auth-divider">
            <span>ou continue com</span>
          </div>

          {!googleClientId ? (
            <div className="auth-message auth-error">
              Login com Google ainda não configurado. Adicione
              VITE_GOOGLE_CLIENT_ID às variáveis de ambiente.
            </div>
          ) : (
            <div className="auth-google-wrap">
              <div ref={googleButtonRef} className="auth-google-button" />
            </div>
          )}

          <div className="auth-switch">
            {mode === 'login'
              ? 'Ainda não tem uma conta?'
              : 'Já tem uma conta?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setMessage('');
              }}
            >
              {mode === 'login' ? 'Criar conta' : 'Fazer login'}
            </button>
          </div>

          <p className="auth-footer">
            VICO HUB © 2026 · Feito para criadores 💜
          </p>
        </section>
      </main>
    );
  }

  return (
    <>
      {children}
      <button
        className="auth-signout"
        type="button"
        onClick={handleSignOut}
        title="Sair da conta"
      >
        <LogOut size={16} />
        Sair da conta
      </button>
      {error && <div className="auth-floating-error">{error}</div>}
    </>
  );
}
