import { permanentRedirect } from 'next/navigation';

export default function DangKyNghiPhepAliasPage() {
  permanentRedirect('/login-eras/'); // business-text-ok: target alias path
}
