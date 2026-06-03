// Register page. Ported from design-handoff/.../auth.jsx RegisterScreen.
// Adds name + terms-checkbox compared to login; same validation rules as server
// (name >=2, valid email, password >=8). Submits to /api/auth/register.
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { AuthShell } from '@/components/AuthShell';
import { Brand } from '@/components/Brand';
import { Field } from '@/components/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/GoogleButton';
import { useAuth } from '@/stores/auth';
import { firstFieldError, normaliseError, type FieldErrors } from '@/lib/errors';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function Register() {
  const navigate = useNavigate();
  const register = useAuth((s) => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverFields, setServerFields] = useState<FieldErrors>({});
  const [topError, setTopError] = useState<string | null>(null);

  const clientErrs = {
    name: touched && name.trim().length < 2 ? 'Please enter your name' : undefined,
    email: touched && !EMAIL_RE.test(email) ? 'Enter a valid email address' : undefined,
    password: touched && password.length < 8 ? 'Password must be at least 8 characters' : undefined,
    agree: touched && !agree ? 'You must accept the terms to continue' : undefined,
  };

  const nameErr = clientErrs.name ?? firstFieldError(serverFields, 'name');
  const emailErr = clientErrs.email ?? firstFieldError(serverFields, 'email');
  const pwErr = clientErrs.password ?? firstFieldError(serverFields, 'password');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    setServerFields({});
    setTopError(null);
    if (
      name.trim().length < 2 ||
      !EMAIL_RE.test(email) ||
      password.length < 8 ||
      !agree
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await register({ name: name.trim(), email, password });
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
          Create your account
        </h1>
        <p className="text-sm text-text-muted text-center mb-6">
          Start building AI chatbots in minutes
        </p>

        {topError ? (
          <div className="mb-4 rounded-input bg-danger-soft border border-danger/25 text-danger text-sm px-3.5 py-2.5">
            {topError}
          </div>
        ) : null}

        <Field label="Full name" htmlFor="name" error={nameErr}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Jordan Meyer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            hasError={!!nameErr}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={emailErr}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            hasError={!!emailErr}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={pwErr} hint="At least 8 characters">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hasError={!!pwErr}
          />
        </Field>

        <div className="flex items-start gap-2.5 mb-4">
          <button
            type="button"
            onClick={() => setAgree((v) => !v)}
            aria-pressed={agree}
            className={cn(
              'mt-0.5 grid place-items-center w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex-none transition-colors',
              agree
                ? 'bg-primary border-primary text-white'
                : 'bg-surface border-border-strong text-transparent'
            )}
          >
            {agree ? <Check size={13} strokeWidth={3} /> : null}
          </button>
          <label
            onClick={() => setAgree((v) => !v)}
            className="text-[13px] text-text leading-relaxed cursor-pointer select-none"
          >
            I agree to the{' '}
            <a
              className="font-semibold text-primary hover:text-primary-dark"
              onClick={(e) => e.stopPropagation()}
            >
              Terms
            </a>{' '}
            and{' '}
            <a
              className="font-semibold text-primary hover:text-primary-dark"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </a>
          </label>
        </div>
        {clientErrs.agree ? (
          <p className="text-xs font-medium text-danger -mt-2 mb-3">{clientErrs.agree}</p>
        ) : null}

        <Button type="submit" variant="primary" size="lg" block disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>

        <div className="flex items-center gap-3.5 my-5 text-xs font-semibold text-text-muted">
          <span className="flex-1 h-px bg-border" />
          or
          <span className="flex-1 h-px bg-border" />
        </div>

        <GoogleButton label="Continue with Google" />

        <p className="text-center text-sm text-text-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
