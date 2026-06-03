// Login page. Ported from design-handoff/.../auth.jsx LoginScreen — same field
// layout (icon-prefixed email + password, forgot-password link, primary CTA,
// divider, Google placeholder, footer link to register). Submits to /api/auth/login.
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { AuthShell } from '@/components/AuthShell';
import { Brand } from '@/components/Brand';
import { Field } from '@/components/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/GoogleButton';
import { useAuth } from '@/stores/auth';
import { firstFieldError, normaliseError, type FieldErrors } from '@/lib/errors';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function Login() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverFields, setServerFields] = useState<FieldErrors>({});
  const [topError, setTopError] = useState<string | null>(null);

  const clientEmailErr =
    touched && !EMAIL_RE.test(email) ? 'Enter a valid email address' : undefined;
  const clientPwErr = touched && password.length < 1 ? 'Password is required' : undefined;

  const emailErr = clientEmailErr ?? firstFieldError(serverFields, 'email');
  const pwErr = clientPwErr ?? firstFieldError(serverFields, 'password');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    setServerFields({});
    setTopError(null);
    if (!EMAIL_RE.test(email) || password.length < 1) return;
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err) {
      const { message, fields } = normaliseError(err);
      setTopError(message);
      setServerFields(fields);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <form onSubmit={submit} noValidate>
        <div className="flex justify-center mb-6">
          <Brand />
        </div>
        <h1 className="font-serif text-[28px] font-semibold text-text-strong text-center tracking-tight mb-1.5">
          Welcome back
        </h1>
        <p className="text-sm text-text-muted text-center mb-6">
          Sign in to your chatbot dashboard
        </p>

        {topError ? (
          <div className="mb-4 rounded-input bg-danger-soft border border-danger/25 text-danger text-sm px-3.5 py-2.5">
            {topError}
          </div>
        ) : null}

        <Field label="Email" htmlFor="email" error={emailErr}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Mail size={18} />
            </span>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              hasError={!!emailErr}
              className="pl-10"
            />
          </div>
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={pwErr}
          action={
            <button
              type="button"
              onClick={() => {}}
              className="text-[13px] font-semibold text-primary hover:text-primary-dark"
            >
              Forgot password?
            </button>
          }
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Lock size={18} />
            </span>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hasError={!!pwErr}
              className="pl-10"
            />
          </div>
        </Field>

        <Button type="submit" variant="primary" size="lg" block disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <div className="flex items-center gap-3.5 my-5 text-xs font-semibold text-text-muted">
          <span className="flex-1 h-px bg-border" />
          or
          <span className="flex-1 h-px bg-border" />
        </div>

        <GoogleButton label="Continue with Google" />

        <p className="text-center text-sm text-text-muted mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-dark">
            Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
