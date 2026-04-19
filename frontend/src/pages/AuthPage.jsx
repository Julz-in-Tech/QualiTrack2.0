import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import { useAuth } from "../contexts/AuthContext";

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_.@-]+$/, "Only letters, numbers, _ . - @ allowed"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name too long"),
    email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function AuthPage() {
  const [mode, setMode] = useState("login" || "signup");

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(to bottom right, rgba(243, 244, 246, 0.4), rgba(59, 130, 246, 0.1))', padding: '1rem' }}>
      <Toaster richColors position="top-right" />
      <div style={{ margin: '0 auto', display: 'flex', minHeight: 'calc(100vh - 4rem)', maxWidth: '64rem', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '1.5rem', backgroundColor: 'var(--card)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid var(--border)', minHeight: '600px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
            {/* Mobile mode toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(243, 244, 246, 0.3)', padding: '0.75rem' }} className="md:hidden">
              <Button type="button" size="sm" variant={mode === "login" ? "default" : "ghost"} onClick={() => setMode("login")}>Login</Button>
              <Button type="button" size="sm" variant={mode === "signup" ? "default" : "ghost"} onClick={() => setMode("signup")}>Register</Button>
            </div>

            <BrandPanel
              mode={mode}
              onSwitch={() => setMode((m) => (m === "login" ? "signup" : "login"))}
              className={mode === "login" ? "md:order-1" : "md:order-2"}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} className={`${mode === "login" ? "md:order-2" : "md:order-1"}`}>
              {mode === "login"
                ? <LoginForm onSwitch={() => setMode("signup")} />
                : <SignupForm onSwitch={() => setMode("login")} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandPanel({ mode, onSwitch, className }) {
  const isLogin = mode === "login";
  return (
    <div
      style={{
        position: 'relative',
        display: 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom right, var(--brand-color), var(--brand-deep))',
        padding: '2.5rem',
        color: 'var(--brand-foreground)',
        borderTopRightRadius: isLogin ? "40% 60%" : 0,
        borderBottomRightRadius: isLogin ? "40% 60%" : 0,
        borderTopLeftRadius: !isLogin ? "40% 60%" : 0,
        borderBottomLeftRadius: !isLogin ? "40% 60%" : 0,
      }}
      className="md:flex"
    >
      <div style={{ position: 'absolute', pointerEvents: 'none', left: '-4rem', top: '-4rem', height: '14rem', width: '14rem', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.1)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', pointerEvents: 'none', bottom: '-5rem', right: '-2.5rem', height: '18rem', width: '18rem', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.1)', filter: 'blur(64px)' }} />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '20rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>{isLogin ? "Hello, Welcome!" : "Welcome Back!"}</h2>
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.85)' }}>{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
        <Button
          type="button"
          variant="outline"
          onClick={onSwitch}
          style={{ marginTop: '1.5rem', borderRadius: '9999px', border: '2px solid rgba(255, 255, 255, 0.9)', backgroundColor: 'transparent', padding: '0 2.5rem', color: 'var(--brand-foreground)' }}
          className="hover:bg-brand-foreground hover:text-brand-deep"
        >
          {isLogin ? "Register" : "Login"}
        </Button>
      </div>
    </div>
  );
}

function LoginForm({ onSwitch }) {
  const [show, setShow] = useState(false);
  const { login } = useAuth();
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { username: "", password: "" } });

  async function onSubmit(values) {
    try {
      // For demo purposes, we'll use the username as email with a demo domain
      const email = `${values.username}@qualitrack.demo`;
      await login(email, values.password);
      toast.success(`Welcome back, ${values.username}!`);
      form.reset();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} style={{ width: '100%', maxWidth: '24rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>Login</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Sign in to continue to QualiTrack</p>
      </div>

      <FieldWithIcon id="username" label="Username" icon={<User style={{ height: '1rem', width: '1rem' }} />} error={form.formState.errors.username?.message}>
        <Input id="username" placeholder="Username" maxLength={50} autoComplete="username" {...form.register("username")} />
      </FieldWithIcon>

      <FieldWithIcon
        id="password"
        label="Password"
        icon={<Lock style={{ height: '1rem', width: '1rem' }} />}
        error={form.formState.errors.password?.message}
        trailing={
          <button type="button" onClick={() => setShow((s) => !s)} style={{ color: 'var(--muted-foreground)' }} className="hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff style={{ height: '1rem', width: '1rem' }} /> : <Eye style={{ height: '1rem', width: '1rem' }} />}
          </button>
        }
      >
        <Input id="password" type={show ? "text" : "password"} placeholder="Password" maxLength={128} autoComplete="current-password" {...form.register("password")} />
      </FieldWithIcon>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <button type="button" style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textDecoration: 'none' }} className="hover:text-foreground hover:underline" onClick={() => toast.info("Password reset is not enabled in this demo.")}>
          Forgot Password?
        </button>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting} style={{ width: '100%', borderRadius: '9999px', background: 'linear-gradient(to right, var(--brand-deep), var(--brand-color))', padding: '1.5rem 0', fontSize: '1rem', fontWeight: '600', color: 'var(--brand-foreground)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} className="hover:opacity-95">
        Login
      </Button>

      <SocialDivider label="or login with social platforms" />
      <SocialIcons />

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)' }} className="md:hidden">
        Don't have an account?{" "}
        <button type="button" onClick={onSwitch} style={{ fontWeight: '500', color: 'var(--brand-deep)', textDecoration: 'underline' }}>Register</button>
      </p>
    </form>
  );
}

function SignupForm({ onSwitch }) {
  const [show, setShow] = useState(false);
  const { signup } = useAuth();
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values) {
    try {
      await signup(values.email, values.password, values.name);
      toast.success(`Account created for ${values.email}.`);
      form.reset();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} style={{ width: '100%', maxWidth: '24rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>Registration</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Create your QualiTrack account</p>
      </div>

      <FieldWithIcon id="name" label="Full name" icon={<User style={{ height: '1rem', width: '1rem' }} />} error={form.formState.errors.name?.message}>
        <Input id="name" placeholder="Full name" maxLength={80} {...form.register("name")} />
      </FieldWithIcon>

      <FieldWithIcon id="email" label="Email" icon={<Mail style={{ height: '1rem', width: '1rem' }} />} error={form.formState.errors.email?.message}>
        <Input id="email" type="email" placeholder="you@company.com" maxLength={255} autoComplete="email" {...form.register("email")} />
      </FieldWithIcon>

      <FieldWithIcon
        id="signup-password"
        label="Password"
        icon={<Lock style={{ height: '1rem', width: '1rem' }} />}
        error={form.formState.errors.password?.message}
        trailing={
          <button type="button" onClick={() => setShow((s) => !s)} style={{ color: 'var(--muted-foreground)' }} className="hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff style={{ height: '1rem', width: '1rem' }} /> : <Eye style={{ height: '1rem', width: '1rem' }} />}
          </button>
        }
      >
        <Input id="signup-password" type={show ? "text" : "password"} placeholder="Password" maxLength={128} autoComplete="new-password" {...form.register("password")} />
      </FieldWithIcon>

      <FieldWithIcon id="confirm-password" label="Confirm password" icon={<Lock style={{ height: '1rem', width: '1rem' }} />} error={form.formState.errors.confirmPassword?.message}>
        <Input id="confirm-password" type={show ? "text" : "password"} placeholder="Confirm password" maxLength={128} autoComplete="new-password" {...form.register("confirmPassword")} />
      </FieldWithIcon>

      <Button type="submit" disabled={form.formState.isSubmitting} style={{ width: '100%', borderRadius: '9999px', background: 'linear-gradient(to right, var(--brand-deep), var(--brand-color))', padding: '1.5rem 0', fontSize: '1rem', fontWeight: '600', color: 'var(--brand-foreground)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} className="hover:opacity-95">
        Register
      </Button>

      <SocialDivider label="or register with social platforms" />
      <SocialIcons />

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)' }} className="md:hidden">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} style={{ fontWeight: '500', color: 'var(--brand-deep)', textDecoration: 'underline' }}>Login</button>
      </p>
    </form>
  );
}

function FieldWithIcon({ id, label, icon, trailing, error, children }) {
  return (
    <div style={{ marginBottom: '0.375rem' }}>
      <Label htmlFor={id} className="sr-only">{label}</Label>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '9999px',
        border: error ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid var(--border)',
        backgroundColor: 'rgba(243, 244, 246, 0.4)',
        paddingLeft: '1rem',
        paddingRight: '0.75rem',
        transition: 'all 0.15s ease-in-out'
      }} className="focus-within:border-brand focus-within:bg-background">
        <span style={{ color: 'var(--muted-foreground)' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          {children}
        </div>
        {trailing}
      </div>
      {error && <p style={{ paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--destructive)' }}>{error}</p>}
    </div>
  );
}

function SocialDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border)' }} />
      <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{label}</span>
      <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border)' }} />
    </div>
  );
}

function SocialIcons() {
  const socials = [
    { name: "Google", letter: "G" },
    { name: "Facebook", letter: "f" },
    { name: "GitHub", letter: "" },
    { name: "LinkedIn", letter: "in" },
  ];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
      {socials.map((s) => (
        <button
          key={s.name}
          type="button"
          aria-label={`Continue with ${s.name}`}
          onClick={() => toast.info(`${s.name} sign-in is decorative in this demo.`)}
          style={{
            display: 'flex',
            height: '2.75rem',
            width: '2.75rem',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--background)',
            fontSize: '0.875rem',
            fontWeight: '700',
            color: 'var(--foreground)',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            transition: 'all 0.15s ease-in-out'
          }}
          className="hover:border-brand hover:text-brand-deep"
        >
          {s.letter || <span style={{ display: 'inline-block', height: '0.75rem', width: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--foreground)' }} aria-hidden />}
        </button>
      ))}
    </div>
  );
}
