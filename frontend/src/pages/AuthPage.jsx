import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ register = false }) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (register) await signUp(form);
      else await signIn({ email: form.email, password: form.password });
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration"><div className="auth-orbit orbit-one" /><div className="auth-orbit orbit-two" /><div className="auth-quote"><span>✳</span><p>“A budget is telling your money where to go instead of wondering where it went.”</p><small>— JOHN C. MAXWELL</small></div><div className="auth-bottom">A LITTLE MORE CLARITY, EVERY DAY.</div></div>
      <section className="auth-panel">
        <a className="brand auth-brand" href="/"><span className="brand-mark">p.</span><span>pennywise</span></a>
        <div className="auth-form-wrap">
          <div className="eyebrow">YOUR FINANCIAL HOME</div>
          <h1>{register ? "Make room to grow." : "Good to see you."}</h1>
          <p className="auth-subtitle">{register ? "Start building a healthier relationship with your money." : "Sign in and pick up right where you left off."}</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            {register && <div className="mb-3"><label className="form-label">Your name</label><input className="form-control field-control" name="name" value={form.name} onChange={update} autoComplete="name" minLength="2" maxLength="80" required placeholder="Jamie Parker" /></div>}
            <div className="mb-3"><label className="form-label">Email address</label><input className="form-control field-control" name="email" type="email" value={form.email} onChange={update} autoComplete="email" required placeholder="you@example.com" /></div>
            <div className="mb-4"><label className="form-label">Password</label><input className="form-control field-control" name="password" type="password" value={form.password} onChange={update} autoComplete={register ? "new-password" : "current-password"} minLength={register ? "8" : undefined} required placeholder={register ? "At least 8 characters" : "Enter your password"} /></div>
            <button className="btn-primary-custom auth-submit" disabled={busy}>{busy ? "One moment…" : register ? "Create your account" : "Sign in"} <span>→</span></button>
          </form>
          <p className="auth-switch">{register ? "Already have an account?" : "New to Pennywise?"} <Link to={register ? "/login" : "/register"}>{register ? "Sign in" : "Create an account"}</Link></p>
        </div>
        <div className="auth-legal">YOUR DATA IS PRIVATE, ALWAYS.</div>
      </section>
    </main>
  );
}
