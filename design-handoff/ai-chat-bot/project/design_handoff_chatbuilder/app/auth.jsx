// auth.jsx — Login + Register screens
const { useState: useStateA } = React;

function Wordmark() {
  return (
    <div className="auth-brand">
      <span className="brand-logo">
        <Icon name="messageSquare" size={19} />
        <span className="spark"><Icon name="sparkles" size={13} /></span>
      </span>
      <span className="brand-name">Chat<b>Builder</b></span>
    </div>
  );
}

function GoogleBtn({ label }) {
  return (
    <button className="btn-google" type="button">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.5-5.2l-6.2-5.3c-2 1.5-4.6 2.4-7.3 2.4-5.2 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.2 5.3c-.4.4 6.6-4.8 6.6-14.7 0-1.2-.1-2.3-.4-3.5z"/></svg>
      {label}
    </button>
  );
}

function LoginScreen({ go }) {
  const [email, setEmail] = useStateA('');
  const [pw, setPw] = useStateA('');
  const [touched, setTouched] = useStateA(false);
  const [loading, setLoading] = useStateA(false);
  const emailErr = touched && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? 'Enter a valid email address' : '';
  const pwErr = touched && pw.length < 1 ? 'Password is required' : '';
  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || pw.length < 1) return;
    setLoading(true);
    setTimeout(() => go('dashboard'), 600);
  };
  return (
    <div className="auth-wrap">
      <div className="auth-bg" />
      <form className="auth-card fade-in" onSubmit={submit} noValidate>
        <Wordmark />
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to your chatbot dashboard</p>
        <Field label="Email" error={emailErr}>
          <div className="input-wrap">
            <span className="input-icon"><Icon name="mail" size={18} /></span>
            <input className={'input' + (emailErr ? ' input-error' : '')} type="email" placeholder="you@company.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </Field>
        <Field label="Password" error={pwErr}
          action={<a className="link" style={{ fontSize: 13 }} onClick={(e) => e.preventDefault()}>Forgot password?</a>}>
          <div className="input-wrap">
            <span className="input-icon"><Icon name="lock" size={18} /></span>
            <input className={'input' + (pwErr ? ' input-error' : '')} type="password" placeholder="••••••••"
              value={pw} onChange={e => setPw(e.target.value)} />
          </div>
        </Field>
        <Btn type="submit" variant="primary" size="lg" className="btn-block" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Btn>
        <div className="divider">or</div>
        <GoogleBtn label="Continue with Google" />
        <p className="auth-foot">Don't have an account? <a onClick={() => go('register')}>Sign up</a></p>
      </form>
    </div>
  );
}

function RegisterScreen({ go }) {
  const [name, setName] = useStateA('');
  const [email, setEmail] = useStateA('');
  const [pw, setPw] = useStateA('');
  const [agree, setAgree] = useStateA(false);
  const [touched, setTouched] = useStateA(false);
  const [loading, setLoading] = useStateA(false);
  const nameErr = touched && name.trim().length < 2 ? 'Please enter your name' : '';
  const emailErr = touched && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? 'Enter a valid email address' : '';
  const pwErr = touched && pw.length < 8 ? 'Password must be at least 8 characters' : '';
  const agreeErr = touched && !agree ? 'You must accept the terms to continue' : '';
  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (name.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || pw.length < 8 || !agree) return;
    setLoading(true);
    setTimeout(() => go('dashboard'), 600);
  };
  return (
    <div className="auth-wrap">
      <div className="auth-bg" />
      <form className="auth-card fade-in" onSubmit={submit} noValidate>
        <Wordmark />
        <h1>Create your account</h1>
        <p className="auth-sub">Start building AI chatbots in minutes</p>
        <Field label="Full name" error={nameErr}>
          <input className={'input' + (nameErr ? ' input-error' : '')} placeholder="Jordan Meyer"
            value={name} onChange={e => setName(e.target.value)} />
        </Field>
        <Field label="Email" error={emailErr}>
          <input className={'input' + (emailErr ? ' input-error' : '')} type="email" placeholder="you@company.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" error={pwErr} hint="At least 8 characters">
          <input className={'input' + (pwErr ? ' input-error' : '')} type="password" placeholder="••••••••"
            value={pw} onChange={e => setPw(e.target.value)} />
        </Field>
        <div className="check-row">
          <span className={'checkbox' + (agree ? ' on' : '')} onClick={() => setAgree(a => !a)}>
            {agree ? <Icon name="check" /> : null}
          </span>
          <label onClick={() => setAgree(a => !a)}>
            I agree to the <a className="link" onClick={(e) => e.stopPropagation()}>Terms</a> and{' '}
            <a className="link" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>
          </label>
        </div>
        {agreeErr ? <div className="field-err" style={{ marginTop: -10, marginBottom: 12 }}>{agreeErr}</div> : null}
        <Btn type="submit" variant="primary" size="lg" className="btn-block" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Btn>
        <div className="divider">or</div>
        <GoogleBtn label="Continue with Google" />
        <p className="auth-foot">Already have an account? <a onClick={() => go('login')}>Sign in</a></p>
      </form>
    </div>
  );
}

Object.assign(window, { LoginScreen, RegisterScreen });
