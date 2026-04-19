import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import { useAuth } from "../contexts/AuthContext";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid work email")
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

function AuthPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-muted/40 via-background to-brand/10">
      <Toaster richColors position="top-right" />
      <div className="relative w-full overflow-hidden bg-card shadow-2xl ring-1 ring-border/50 min-h-screen">
        <div className="grid md:grid-cols-2 min-h-screen">
          <BrandPanel />
          <div className="flex items-center justify-center p-6 sm:p-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div
      className="relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand to-brand-deep p-10 text-brand-foreground md:flex"
      style={{
        borderTopRightRadius: "40% 60%",
        borderBottomRightRadius: "40% 60%",
      }}
    >
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 max-w-xs text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-foreground/15 ring-1 ring-brand-foreground/30 backdrop-blur">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">QualiTrack</h2>
        <p className="mt-3 text-sm text-brand-foreground/85">
          Quality control & receiving inspection, built for your team.
        </p>
      </div>
    </div>
  );
}

function LoginForm() {
  const [show, setShow] = useState(false);
  const { login } = useAuth();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values) {
    try {
      await login(values.email, values.password);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      form.setError("root", { message });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-5">
      <div className="space-y-1 text-center md:text-left">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand-deep md:hidden">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Use your company account to access QualiTrack.
        </p>
      </div>

      <FieldWithIcon
        id="email"
        label="Work email"
        icon={<Mail className="h-4 w-4" />}
        error={form.formState.errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          maxLength={255}
          autoComplete="email"
          {...form.register("email")}
        />
      </FieldWithIcon>

      <FieldWithIcon
        id="password"
        label="Password"
        icon={<Lock className="h-4 w-4" />}
        error={form.formState.errors.password?.message}
        trailing={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      >
        <Input
          id="password"
          type={show ? "text" : "password"}
          placeholder="Password"
          maxLength={128}
          autoComplete="current-password"
          {...form.register("password")}
        />
      </FieldWithIcon>

      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          onClick={() => toast.info("Contact your administrator to reset your password.")}
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full rounded-full bg-gradient-to-r from-brand-deep to-brand py-6 text-base font-semibold text-brand-foreground shadow-lg hover:opacity-95"
      >
        Sign in
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Need access?{" "}
        <button
          type="button"
          onClick={() => toast.info("Please contact your QualiTrack administrator.")}
          className="font-medium text-brand-deep underline-offset-2 hover:underline"
        >
          Contact your administrator
        </button>
      </p>

      {form.formState.errors.root && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-xs text-destructive">
          {form.formState.errors.root.message}
        </div>
      )}
    </form>
  );
}

function FieldWithIcon({
  id,
  label,
  icon,
  trailing,
  error,
  children,
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <div
        className={`group relative flex items-center rounded-full border bg-muted/40 pl-4 pr-3 transition focus-within:border-brand focus-within:bg-background ${
          error ? "border-destructive/60" : "border-input"
        }`}
      >
        <span className="text-muted-foreground">{icon}</span>
        <div className="flex-1 [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-3 [&_input]:py-3 [&_input]:shadow-none [&_input]:focus-visible:ring-0">
          {children}
        </div>
        {trailing}
      </div>
      {error && <p className="px-4 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default AuthPage;
