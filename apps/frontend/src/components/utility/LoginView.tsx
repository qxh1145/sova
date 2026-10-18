import type { LoginFormContent, UtilityContent } from '@/types/content';
import { RichText } from '@/components/ui/RichText';
import { LoginForm } from '@/components/forms/LoginForm';

export interface LoginViewProps {
  content: UtilityContent & { login: LoginFormContent };
  wordmark: string;
  demoNotice: string;
}

export function LoginView({ content, wordmark, demoNotice }: LoginViewProps) {
  return (
    <div id="login" className="row justify-content-center align-items-center">
      <div className="col lg-6 short-info py-4">
        <div className="col-inner">
          <div id="logo" className="d-none d-sm-block text-white">
            {wordmark}
          </div>
          <RichText content={content.body} />
        </div>
      </div>

      <div className="col lg-6 form-wrapper">
        <div className="col-inner">
          <LoginForm form={content.login} demoNotice={demoNotice} />
        </div>
      </div>

      <div className="logo d-block d-md-none mb-4">
        <div className="d-flex justify-content-center text-white">{wordmark}</div>
      </div>

      <div className="privacy-policy-page-link">
        <a className="privacy-policy-link" href={content.login.privacyHref} rel="privacy-policy">
          {content.login.privacyText}
        </a>
      </div>
    </div>
  );
}
