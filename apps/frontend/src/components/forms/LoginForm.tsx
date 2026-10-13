'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  loginSchema,
  zodResolver,
  type LoginFormValues,
} from '@/lib/forms/schemas';
import { useHydrated } from '@/lib/forms/useHydrated';
import type { LoginFormContent } from '@/types/content';

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 4.5C5.5 4.5 1.73 7.61 1 10c.73 2.39 4.5 5.5 9 5.5s8.27-3.11 9-5.5c-.73-2.39-4.5-5.5-9-5.5Zm0 9a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm0-5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="m3.28 2.22-1.06 1.06 2.3 2.3A9.87 9.87 0 0 0 1 10c.73 2.39 4.5 5.5 9 5.5 1.95 0 3.73-.58 5.2-1.57l1.52 1.51 1.06-1.06L3.28 2.22ZM10 13.5c-3.5 0-6.6-2.22-7.5-3.5.53-.76 1.94-2.17 3.86-2.92l1.62 1.62a2 2 0 0 0 2.42 2.42l1.62 1.62c-.65.48-1.34.76-2.02.76Zm0-9c1.65 0 3.19.43 4.54 1.18l-1.6 1.6A3.5 3.5 0 0 0 8.3 8.3L6.7 6.7C7.71 5.92 8.83 5.5 10 5.5Zm6.5 4.5c-.32.46-.8 1.05-1.42 1.65l1.08 1.08A11.7 11.7 0 0 0 19 10c-.73-2.39-4.5-5.5-9-5.5-.33 0-.66.02-.98.05l1.63 1.63c.43-.11.88-.18 1.35-.18 3.5 0 6.6 2.22 7.5 3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="login-error text-danger d-block mt-1" role="alert">
      {message}
    </span>
  );
}

export interface LoginFormProps {
  form: LoginFormContent;
  demoNotice: string;
}

export function LoginForm({ form, demoNotice }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  // Submit stays disabled until hydration: a native POST would send the credentials.
  const hydrated = useHydrated();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(
      loginSchema({
        usernameRequired: form.usernameRequired,
        passwordRequired: form.passwordRequired,
      }),
    ),
    defaultValues: {
      log: '',
      pwd: '',
      rememberme: false,
    },
  });

  const onSubmit = handleSubmit(
    () => {
      setShowNotice(true);
    },
    () => {
      setShowNotice(false);
    },
  );

  return (
    <>
      {showNotice && (
        <div className="notice" role="status">
          {demoNotice}
        </div>
      )}

      <form
        name="loginform"
        id="loginform"
        method="post"
        noValidate
        onSubmit={onSubmit}
      >
        <h1 className="text-center">{form.heading}</h1>
        <p className="text-center mt-3 mb-4">
          {form.noAccountText}{' '}
          <a href={form.registerHref} className="text-decoration-none">
            {form.registerText}
          </a>
        </p>

        <p style={{ padding: '0 12px' }}>
          <input
            placeholder={form.usernamePlaceholder}
            type="text"
            id="user_login"
            className="input"
            size={20}
            autoCapitalize="off"
            autoComplete="username"
            aria-invalid={errors.log ? 'true' : 'false'}
            {...register('log')}
          />
          <FieldError message={errors.log?.message} />
        </p>

        <div style={{ padding: '0 12px' }} className="user-pass-wrap">
          <div className="wp-pwd">
            <input
              placeholder={form.passwordPlaceholder}
              type={showPassword ? 'text' : 'password'}
              id="user_pass"
              className="input password-input"
              size={20}
              autoComplete="current-password"
              spellCheck="false"
              aria-invalid={errors.pwd ? 'true' : 'false'}
              {...register('pwd')}
            />
            <button
              type="button"
              className="button button-secondary wp-hide-pw hide-if-no-js"
              data-toggle={showPassword ? '1' : '0'}
              aria-pressed={showPassword}
              aria-label={
                showPassword ? form.hidePasswordLabel : form.showPasswordLabel
              }
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <span
                className={`dashicons ${
                  showPassword ? 'dashicons-hidden' : 'dashicons-visibility'
                }`}
                aria-hidden="true"
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </span>
            </button>
          </div>
          <FieldError message={errors.pwd?.message} />
        </div>

        <div className="row mx-0 justify-content-around align-items-center">
          <p className="col lg-6 forgetmenot">
            <input
              type="checkbox"
              name="rememberme"
              id="rememberme"
              value="forever"
              checked={rememberMe}
              onChange={(e) => {
                setRememberMe(e.target.checked);
                setValue('rememberme', e.target.checked);
              }}
            />{' '}
            <label htmlFor="rememberme">{form.rememberLabel}</label>
          </p>
          <p
            id="nav"
            className="col lg-6 mt-0 justify-content-end d-flex align-items-center"
          >
            <a className="wp-login-lost-password" href={form.lostPasswordHref}>
              {form.lostPasswordText}
            </a>
          </p>
        </div>

        <p className="submit d-flex justify-content-center mt-4">
          <input
            type="submit"
            name="wp-submit"
            id="wp-submit"
            className="button button-primary button-large"
            value={form.submitLabel}
            disabled={!hydrated}
          />
        </p>
      </form>
    </>
  );
}
