import { authChangePasswordAction } from "@repo/graphql";
import { createMemo, createSignal, For } from "solid-js";
import { Icon } from "solid-heroicons";
import { checkCircle, exclamationCircle, eye, eyeSlash, lockClosed } from "solid-heroicons/outline";
import { toast } from "../../components/common/Toast";
import type { loadUserDashboardData } from "../../lib/user-dashboard";
import { useAuthStore } from "../../stores/auth-store";

type DashboardData = ReturnType<typeof loadUserDashboardData>;

export function UserSettingForm(props: { data: DashboardData }) {
  const customer = props.data.customer;
  const authUser = useAuthStore((state) => state.user);
  const customerName = createMemo(
    () => authUser()?.name?.trim() || customer.title,
  );
  const handleUpdate = () => {
    toast.success("Settings updated successfully.");
  };

  return (
    <div>
      <PageHeading
        title="Setting"
        copy="Manage payments: receiveable, received, processing in your Reseller Dashboard."
      />

      <fieldset class="grid gap-5 sm:grid-cols-3">
        <FloatingInput label="Shop Name" value={customerName()} placeholder="Enter your shop name" />
        <FloatingInput label="Payment Title" value={customer.paymentTitle} placeholder="Enter payment title" />
        <FloatingInput label="Payment NO." value={customer.paymentNo} placeholder="Enter payment no" />
        <FloatingInput label="Refer Code" value={customer.referCode} placeholder="Enter refer code" />
        <For each={customer.note}>
          {(field) => (
            <FloatingInput
              label={field.title}
              value={field.value}
              placeholder={field.placeholder}
            />
          )}
        </For>
      </fieldset>

      <div class="pt-5">
        <div class="flex justify-end">
          <button
            type="button"
            onClick={handleUpdate}
            class="rounded-sm bg-[#8e208c] px-6 py-3 text-sm font-medium text-white shadow-sm"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserPasswordForm() {
  const [oldPassword, setOldPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [submitError, setSubmitError] = createSignal("");
  const [submitSuccess, setSubmitSuccess] = createSignal("");
  const confirmPasswordError = createMemo(() =>
    confirmPassword() && confirmPassword() !== newPassword()
      ? "Passwords do not match."
      : "",
  );
  const isFormValid = createMemo(
    () =>
      Boolean(oldPassword().trim()) &&
      Boolean(newPassword().trim()) &&
      Boolean(confirmPassword().trim()) &&
      !confirmPasswordError(),
  );

  const clearForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleCancel = () => {
    clearForm();
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    if (!isFormValid() || isSubmitting()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");

      const response = await authChangePasswordAction({
        input: {
          currentPassword: oldPassword(),
          newPassword: newPassword(),
        },
      });

      const message = response?.status || "Password updated successfully.";
      setSubmitSuccess(message);
      toast.success(message);
      clearForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update password.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="w-full">
      <div class="border-b border-gray-200 pb-6">
        <h1 class="text-xl font-semibold text-gray-900">Password</h1>
        <p class="mt-3 text-sm text-gray-600">
          Update your password and enhance your account's security.
        </p>
      </div>

      <div class="grid gap-8 border-b border-gray-200 py-8 lg:grid-cols-3">
        <PasswordInput
          id="old-password"
          label="Old Password"
          value={oldPassword()}
          placeholder="Enter your old password"
          autocomplete="current-password"
          onInput={setOldPassword}
        />
        <PasswordInput
          id="new-password"
          label="New Password"
          value={newPassword()}
          placeholder="Enter your new password"
          autocomplete="new-password"
          onInput={setNewPassword}
        />
        <PasswordInput
          id="confirm-new-password"
          label="Confirm New Password"
          value={confirmPassword()}
          placeholder="Confirm new password"
          autocomplete="new-password"
          error={confirmPasswordError()}
          onInput={setConfirmPassword}
        />
      </div>

      <div class="mt-5 min-h-5 space-y-2">
        {submitError() ? <p class="text-sm text-red-600">{submitError()}</p> : null}
        {submitSuccess() ? (
          <p class="text-sm text-green-600">{submitSuccess()}</p>
        ) : null}
      </div>

      <div class="mt-5 flex justify-end gap-4">
        <button
          type="button"
          onClick={handleCancel}
          class="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting()}
          class="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#b767b5] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#9f4f9d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon path={checkCircle} class="h-4 w-4" aria-hidden="true" />
          {isSubmitting() ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function PageHeading(props: { title: string; copy: string }) {
  return (
    <div class="mb-8 flex w-full items-center justify-between">
      <div class="w-full sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">{props.title}</h1>
        <p class="mt-2 text-sm text-gray-700">{props.copy}</p>
      </div>
    </div>
  );
}

function FloatingInput(props: { label: string; value: string; placeholder: string }) {
  return (
    <div class="relative w-full rounded-sm border border-gray-300 px-3 py-3">
      <label class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-sm font-medium text-gray-900">
        {props.label}
      </label>
      <input
        value={props.value}
        placeholder={props.placeholder}
        class="w-full border-0 bg-transparent p-0 text-gray-900 placeholder-gray-500 outline-none focus:ring-0 sm:text-sm"
      />
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <Icon
          path={props.value ? checkCircle : exclamationCircle}
          class="h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function PasswordInput(props: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  autocomplete: string;
  error?: string;
  onInput: (value: string) => void;
}) {
  const [isVisible, setIsVisible] = createSignal(false);

  return (
    <div>
      <div
        class={`relative rounded-md border bg-white shadow-sm transition focus-within:border-[#5d55ff] ${
          props.error ? "border-red-300" : "border-gray-300"
        }`}
      >
        <label
          class={`absolute -top-2.5 left-2 bg-white px-1 text-sm font-medium ${
            props.error ? "text-red-700" : "text-gray-700"
          }`}
          for={props.id}
        >
          {props.label}
        </label>
        <Icon
          path={lockClosed}
          class={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
            props.error ? "text-red-400" : "text-gray-400"
          }`}
          aria-hidden="true"
        />
        <input
          id={props.id}
          value={props.value}
          type={isVisible() ? "text" : "password"}
          placeholder={props.placeholder}
          autocomplete={props.autocomplete}
          onInput={(event) => props.onInput(event.currentTarget.value)}
          aria-invalid={props.error ? "true" : "false"}
          class="h-11 w-full border-0 bg-transparent pl-10 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:ring-0"
        />
        <button
          type="button"
          onClick={() => setIsVisible((value) => !value)}
          aria-label={isVisible() ? "Hide password" : "Show password"}
          class="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 transition hover:text-[#8e208c]"
        >
          <Icon path={isVisible() ? eyeSlash : eye} class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {props.error ? <p class="mt-2 text-sm text-red-600">{props.error}</p> : null}
    </div>
  );
}
