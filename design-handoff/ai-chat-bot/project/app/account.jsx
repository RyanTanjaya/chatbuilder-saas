// account.jsx — Account settings (connective screen for SETTINGS › Account)
const { useState: useStateAc } = React;

function Account({ go }) {
  const [name, setName] = useStateAc('Jordan Meyer');
  const [email, setEmail] = useStateAc('jordan@acme.io');
  const [saved, setSaved] = useStateAc(false);
  const [dirty, setDirty] = useStateAc(false);

  return (
    <Shell screen="account" go={go} narrow title="Account" sub="Manage your profile and plan">
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Profile</div>
        <div className="uploader-box" style={{ marginBottom: 20 }}>
          <span className="uploader-prev" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontWeight: 800, fontSize: 20 }}>JM</span>
          <div>
            <Btn variant="outline" size="sm" icon="upload">Change photo</Btn>
            <div className="field-hint" style={{ marginTop: 6 }}>JPG or PNG, at least 200×200.</div>
          </div>
        </div>
        <div className="grid-2" style={{ gap: 20 }}>
          <Field label="Full name"><input className="input" value={name} onChange={e => { setName(e.target.value); setDirty(true); setSaved(false); }} /></Field>
          <Field label="Email"><input className="input" type="email" value={email} onChange={e => { setEmail(e.target.value); setDirty(true); setSaved(false); }} /></Field>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="row-between">
          <div className="flex items-center gap-12">
            <span className="s-icon" style={{ background: 'var(--purple-soft)', color: 'var(--accent-purple)', width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center', margin: 0 }}><Icon name="creditCard" /></span>
            <div>
              <div className="section-title">Pro plan</div>
              <p className="section-sub mb-0">$49/mo · renews Jun 30, 2026 · 6 of 10 chatbots used</p>
            </div>
          </div>
          <Btn variant="outline" onClick={() => go('embed')}>Manage billing</Btn>
        </div>
      </div>

      <div className="danger-zone">
        <div className="row-between">
          <div>
            <div className="section-title" style={{ color: 'var(--text-strong)' }}>Sign out</div>
            <p className="section-sub mb-0">You'll be returned to the login screen.</p>
          </div>
          <Btn variant="outline" icon="logOut" onClick={() => go('login')}>Sign out</Btn>
        </div>
      </div>

      <div className="sticky-save">
        {saved && <span className="pill pill-live" style={{ alignSelf: 'center' }}><Icon name="check" size={13} />Saved</span>}
        <Btn variant="primary" icon="check" disabled={!dirty} onClick={() => { setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2400); }}>Save changes</Btn>
      </div>
    </Shell>
  );
}

window.Account = Account;
