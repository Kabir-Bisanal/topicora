"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { createClient } from "@/lib/supabase/client";

type Screen = "loading" | "ready" | "enroll" | "challenge" | "enabled";

export function MfaControl({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("loading");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void (async () => {
      const supabase = createClient();
      if (!supabase) {
        setMessage("Supabase authentication is not configured.");
        setScreen("ready");
        return;
      }
      const [factors, assurance] = await Promise.all([
        supabase.auth.mfa.listFactors(),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      ]);
      const verified = factors.data?.totp[0];
      if (verified) {
        setFactorId(verified.id);
        setScreen(
          assurance.data?.currentLevel === "aal2" ? "enabled" : "challenge",
        );
      } else setScreen("ready");
    })();
  }, []);

  const beginEnrollment = async () => {
    setPending(true);
    setMessage("");
    const supabase = createClient();
    if (!supabase) return;
    const existing = await supabase.auth.mfa.listFactors();
    await Promise.all(
      (existing.data?.all ?? [])
        .filter((factor) => factor.status === "unverified")
        .map((factor) => supabase.auth.mfa.unenroll({ factorId: factor.id })),
    );
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Topicora CMS",
      issuer: "Topicora",
    });
    setPending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setScreen("enroll");
  };

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.replace(/\s/g, ""),
    });
    if (error) {
      setPending(false);
      setMessage("That code was not accepted. Wait for a new code and retry.");
      return;
    }
    await fetch("/api/mfa/enabled", { method: "POST" });
    setScreen("enabled");
    setPending(false);
    router.push(nextPath);
    router.refresh();
  };

  if (screen === "loading")
    return <p className="text-muted-foreground">Checking account security…</p>;

  if (screen === "enabled")
    return (
      <div className="border-accent/30 bg-accent/5 rounded-xl border p-6">
        <ShieldCheck className="text-accent" aria-hidden="true" size={28} />
        <h2 className="mt-4 font-serif text-2xl font-semibold">
          MFA is active
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          This session has passed its second-factor check. You can safely return
          to the editorial dashboard.
        </p>
        <button
          className="button-primary mt-5"
          onClick={() => router.push(nextPath)}
          type="button"
        >
          Continue to dashboard
        </button>
      </div>
    );

  return (
    <div className="border-border bg-surface rounded-xl border p-6 sm:p-8">
      <KeyRound className="text-accent" aria-hidden="true" size={28} />
      <h2 className="mt-4 font-serif text-2xl font-semibold">
        {screen === "challenge"
          ? "Enter your security code"
          : "Secure your account"}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {screen === "challenge"
          ? "Open your authenticator app and enter the current six-digit code."
          : "Use a TOTP authenticator such as 1Password, Google Authenticator, or Microsoft Authenticator."}
      </p>
      {message ? (
        <p className="text-danger mt-4 text-sm" role="alert">
          {message}
        </p>
      ) : null}
      {screen === "ready" ? (
        <button
          className="button-primary mt-6"
          type="button"
          onClick={beginEnrollment}
          disabled={pending}
        >
          {pending ? "Preparing…" : "Set up authenticator"}
        </button>
      ) : null}
      {screen === "enroll" && qrCode ? (
        <div className="mt-6 grid gap-5">
          <div className="w-fit rounded-xl bg-white p-4">
            <Image
              src={qrCode}
              alt="Authenticator enrollment QR code"
              width={220}
              height={220}
              unoptimized
            />
          </div>
          <p className="text-muted-foreground text-sm">
            Cannot scan? Enter this secret manually:{" "}
            <code className="text-foreground font-bold break-all">
              {secret}
            </code>
          </p>
        </div>
      ) : null}
      {screen === "enroll" || screen === "challenge" ? (
        <form className="mt-6 grid max-w-sm gap-3" onSubmit={verify}>
          <label className="grid gap-2 text-sm font-bold">
            Six-digit code
            <input
              className="field font-mono text-lg tracking-[0.3em]"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
          </label>
          <button
            className="button-primary justify-self-start"
            disabled={pending}
          >
            {pending ? "Verifying…" : "Verify and continue"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
