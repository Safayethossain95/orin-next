import {
  authForgotPasswordRequestOtpAction,
  authForgotPasswordVerifyOtpAction,
  authLoginAction,
  authRegisterAction,
} from "@repo/graphql";
import { useLocation, useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import { Show, createEffect, createMemo, createSignal, onMount } from "solid-js";
import { toast } from "../components/common/Toast";
import { loadMenuData } from "../lib/home";
import { theme } from "../lib/theme";
import {
  authStore,
  hasStoredAuthSession,
  persistAuthTokens,
  refreshAuthSession,
} from "../stores/auth-store";
import { NavBar } from "../widgets/navbar/NavBar";

type AuthStep = "Login" | "Create" | "Reset";
type ResetStage = "request" | "verify";

type AuthPageProps = {
  initialStep?: AuthStep;
};

type AuthForm = {
  fullName: string;
  identity: string;
  password: string;
  otp: string;
  newPassword: string;
};

const menu = loadMenuData();

function normalizeIdentityInput(identity: string) {
  const normalized = identity.trim();
  if (normalized.includes("@")) {
    return { email: normalized, phone: undefined };
  }

  return {
    email: undefined,
    phone: normalized.replace(/\s+/g, ""),
  };
}

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

export function AuthPage(props: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = createSignal<AuthStep>(props.initialStep ?? "Login");
  const [resetStage, setResetStage] = createSignal<ResetStage>("request");
  const [form, setForm] = createStore<AuthForm>({
    fullName: "",
    identity: "",
    password: "",
    otp: "",
    newPassword: "",
  });
  const [errors, setErrors] = createStore<Partial<Record<keyof AuthForm, string>>>({});
  const [message, setMessage] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [isCheckingAuth, setIsCheckingAuth] = createSignal(true);
  const [showPassword, setShowPassword] = createSignal(false);
  const [showNewPassword, setShowNewPassword] = createSignal(false);
  const searchParams = createMemo(() => new URLSearchParams(location.search));
  const returnTo = createMemo(() => searchParams().get("returnTo") ?? "/");

  const clearErrors = () => {
    setErrors({
      fullName: undefined,
      identity: undefined,
      password: undefined,
      otp: undefined,
      newPassword: undefined,
    });
  };

  const resetTransientState = () => {
    clearErrors();
    setMessage("");
    setResetStage("request");
    setShowPassword(false);
    setShowNewPassword(false);
    setForm("password", "");
    setForm("otp", "");
    setForm("newPassword", "");
  };

  createEffect(() => {
    const params = searchParams();
    setStep(props.initialStep ?? "Login");
    setForm("identity", params.get("identity") ?? "");
    setForm("password", "");
    setForm("otp", "");
    setForm("newPassword", "");
    setMessage(
      params.get("registered") === "1"
        ? "Registration successful. Please log in."
        : params.get("reset") === "1"
          ? "Password updated. Please log in."
          : "",
    );
    clearErrors();
    setResetStage("request");
  });

  onMount(() => {
    if (hasStoredAuthSession()) {
      void refreshAuthSession().then((user) => {
        if (user) {
          void navigate(returnTo(), { replace: true });
          return;
        }

        setIsCheckingAuth(false);
      });
      return;
    }

    authStore.getState().signOut();
    setIsCheckingAuth(false);
  });

  const validate = () => {
    clearErrors();
    let isValid = true;

    if (step() === "Create" && !form.fullName.trim()) {
      setErrors("fullName", "Enter your name.");
      isValid = false;
    }

    if (!form.identity.trim()) {
      setErrors("identity", step() === "Reset" ? "Enter your email address." : "Enter your email or phone.");
      isValid = false;
    }

    if (step() === "Login" && !form.password.trim()) {
      setErrors("password", "Enter your password.");
      isValid = false;
    }

    if (step() === "Login" && form.password.trim() && form.password.trim().length < 4) {
      setErrors("password", "Password must be at least 4 characters.");
      isValid = false;
    }

    if (step() === "Create" && !form.password.trim()) {
      setErrors("password", "Enter a password.");
      isValid = false;
    }

    if (step() === "Create" && form.password.trim() && form.password.trim().length < 4) {
      setErrors("password", "Password must be at least 4 characters.");
      isValid = false;
    }

    if (step() === "Reset" && !isEmail(form.identity)) {
      setErrors("identity", "Password reset currently supports email only.");
      isValid = false;
    }

    if (step() === "Reset" && resetStage() === "verify" && !form.otp.trim()) {
      setErrors("otp", "Enter the OTP code.");
      isValid = false;
    }

    if (step() === "Reset" && resetStage() === "verify" && !form.newPassword.trim()) {
      setErrors("newPassword", "Enter your new password.");
      isValid = false;
    }

    if (
      step() === "Reset" &&
      resetStage() === "verify" &&
      form.newPassword.trim() &&
      form.newPassword.trim().length < 4
    ) {
      setErrors("newPassword", "Password must be at least 4 characters.");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    const response = await authLoginAction({
      input: {
        ...normalizeIdentityInput(form.identity),
        password: form.password,
      },
    });

    if (!response) {
      throw new Error("Unable to log in.");
    }

    persistAuthTokens(response);
    const user = await refreshAuthSession({ clearOnFailure: false });
    authStore.getState().signIn();
    if (user) {
      authStore.getState().setUser(user);
    }
    toast.success("Logged in successfully.");
    void navigate(returnTo(), { replace: true });
  };

  const handleRegister = async () => {
    const response = await authRegisterAction({
      input: {
        name: form.fullName.trim(),
        ...normalizeIdentityInput(form.identity),
        password: form.password,
      },
    });

    if (!response) {
      throw new Error("Unable to create account.");
    }

    const nextIdentity = encodeURIComponent(form.identity.trim());
    toast.success("Account created successfully. Please log in.");
    void navigate(`/login?registered=1&identity=${nextIdentity}`, { replace: true });
  };

  const handleReset = async () => {
    const email = form.identity.trim();

    if (resetStage() === "request") {
      const response = await authForgotPasswordRequestOtpAction({
        input: { email },
      });

      if (!response) {
        throw new Error("Unable to send OTP right now.");
      }

      setResetStage("verify");
      setMessage("An OTP has been sent to your email. Enter it below with your new password.");
      toast.success("Password reset OTP sent.");
      return;
    }

    const response = await authForgotPasswordVerifyOtpAction({
      input: {
        email,
        otp: form.otp.trim(),
        newPassword: form.newPassword,
      },
    });

    if (!response) {
      throw new Error("Unable to update password.");
    }

    const nextIdentity = encodeURIComponent(email);
    toast.success("Password updated successfully. Please log in.");
    void navigate(`/login?reset=1&identity=${nextIdentity}`, { replace: true });
  };

  const handleSubmit = async () => {
    if (!validate()) {
      const firstError =
        errors.fullName || errors.identity || errors.password || errors.otp || errors.newPassword;
      toast.error(firstError || "Please review the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      if (step() === "Login") {
        await handleLogin();
      } else if (step() === "Create") {
        await handleRegister();
      } else {
        await handleReset();
      }
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Something went wrong.";
      setMessage(nextMessage);
      toast.error(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerTitle = createMemo(() => {
    if (step() === "Create") return "Create your account";
    if (step() === "Reset") return "Reset your password";
    return "Login with Us";
  });

  const headerSubtitle = createMemo(() => {
    if (step() === "Create") return "Register with your name, email or phone number.";
    if (step() === "Reset") {
      return resetStage() === "request"
        ? "Enter your email to receive a password reset OTP."
        : "Verify the OTP and set a new password.";
    }
    return "Use your account details to continue.";
  });

  const submitLabel = createMemo(() => {
    if (step() === "Create") return isSubmitting() ? "Creating Account..." : "Create Account";
    if (step() === "Reset") {
      if (resetStage() === "request") {
        return isSubmitting() ? "Sending OTP..." : "Send OTP";
      }
      return isSubmitting() ? "Updating Password..." : "Update Password";
    }
    return isSubmitting() ? "Logging In..." : "Log In";
  });

  return (
    <div class={theme.authPage}>
      <NavBar menu={menu} />

      <main class="flex min-h-[calc(100dvh-158px)] items-center justify-center px-4 py-16 md:py-24">
        <div class={theme.authCard}>
          <div class="px-5 py-3 text-center text-[15px] font-semibold text-slate-800">
            {headerTitle()}
          </div>

          <div class={theme.authCardSection}>
            <div class="flex items-start gap-4">
              <div class="flex h-11 w-11 items-center justify-center rounded-full bg-[#a11b8f] text-sm font-bold text-[#ffd24d]">
                OR
              </div>
              <div>
                <div class="text-[28px] font-black uppercase leading-none tracking-[-0.05em] text-[#8e208c]">
                  Orin
                </div>
                <p class="mt-1 text-sm font-semibold text-slate-700">
                  Orin Store | Trusted Online Shop
                </p>
                <p class="text-sm text-slate-500">{headerSubtitle()}</p>
              </div>
            </div>

            <Show
              when={!isCheckingAuth()}
              fallback={
                <p class="mt-6 text-sm text-slate-500">Checking your login status...</p>
              }
            >
              <form
                class="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSubmit();
                }}
              >
                <Show when={step() === "Create"}>
                  <InputField
                    label="Full Name"
                    type="text"
                    value={form.fullName}
                    error={errors.fullName}
                    onInput={(value) => setForm("fullName", value)}
                  />
                </Show>

                <InputField
                  label={step() === "Reset" ? "Email" : "Phone or Email"}
                  type="text"
                  value={form.identity}
                  error={errors.identity}
                  onInput={(value) => setForm("identity", value)}
                />

                <Show when={step() !== "Reset"}>
                  <InputField
                    label="Password"
                    type={showPassword() ? "text" : "password"}
                    value={form.password}
                    error={errors.password}
                    trailingButton={
                      <button
                        type="button"
                        class="text-xs font-medium text-slate-500"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword() ? "Hide" : "Show"}
                      </button>
                    }
                    onInput={(value) => setForm("password", value)}
                  />
                </Show>

                <Show when={step() === "Reset" && resetStage() === "verify"}>
                  <InputField
                    label="OTP"
                    type="text"
                    value={form.otp}
                    error={errors.otp}
                    onInput={(value) => setForm("otp", value)}
                  />
                  <InputField
                    label="New Password"
                    type={showNewPassword() ? "text" : "password"}
                    value={form.newPassword}
                    error={errors.newPassword}
                    trailingButton={
                      <button
                        type="button"
                        class="text-xs font-medium text-slate-500"
                        onClick={() => setShowNewPassword((current) => !current)}
                      >
                        {showNewPassword() ? "Hide" : "Show"}
                      </button>
                    }
                    onInput={(value) => setForm("newPassword", value)}
                  />
                </Show>

                <Show when={message()}>
                  <p class="text-sm text-[#8e208c]">{message()}</p>
                </Show>

                <div class="border-t border-slate-200 pt-5">
                  <button
                    type="submit"
                    disabled={isSubmitting()}
                    class={theme.authPrimaryButton}
                  >
                    {submitLabel()}
                  </button>
                </div>

                <Show when={step() === "Login"}>
                  <div class="text-center text-[15px] font-semibold text-slate-700">Or</div>
                </Show>
              </form>
            </Show>
          </div>

          <div class={`${theme.authCardSection} pt-4`}>
            <Show
              when={step() === "Login"}
              fallback={
                <div class="space-y-3">
                  <Show when={step() === "Create"}>
                    <button
                      type="button"
                      class={theme.authSecondaryButton}
                      onClick={() => {
                        resetTransientState();
                        void navigate(`/login?identity=${encodeURIComponent(form.identity.trim())}`, {
                          replace: true,
                        });
                      }}
                    >
                      Back to Login
                    </button>
                  </Show>
                  <Show when={step() === "Reset"}>
                    <button
                      type="button"
                      class={theme.authSecondaryButton}
                      onClick={() => {
                        resetTransientState();
                        void navigate(`/login?identity=${encodeURIComponent(form.identity.trim())}`, {
                          replace: true,
                        });
                      }}
                    >
                      Back to Login
                    </button>
                  </Show>
                </div>
              }
            >
              <div class="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  class={theme.authSecondaryButton}
                  onClick={() => {
                    resetTransientState();
                    setStep("Reset");
                  }}
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  class={theme.authSecondaryButton}
                  onClick={() => {
                    resetTransientState();
                    void navigate(`/register?identity=${encodeURIComponent(form.identity.trim())}`, {
                      replace: true,
                    });
                  }}
                >
                  Create Account
                </button>
              </div>
            </Show>
          </div>
        </div>
      </main>
    </div>
  );
}

function InputField(props: {
  label: string;
  type: string;
  value: string;
  error?: string;
  trailingButton?: any;
  onInput: (value: string) => void;
}) {
  return (
    <div>
      <div class="relative rounded-none border border-slate-200 bg-white px-2.5 py-1 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
        <label class="absolute -top-2 left-3 bg-white px-1 text-[12px] font-medium text-slate-600">
          {props.label}
        </label>
        <div class="flex items-center gap-2">
          <input
            type={props.type}
            value={props.value}
            onInput={(event) => props.onInput(event.currentTarget.value)}
            class={theme.authInput}
          />
          <Show when={props.trailingButton}>{props.trailingButton}</Show>
        </div>
      </div>
      <Show when={props.error}>
        <p class="mt-1 text-xs text-rose-500">{props.error}</p>
      </Show>
    </div>
  );
}
