import { logout } from "@/app/auth/actions/auth";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-sm text-gray-600">
            We sent a confirmation link to your email address. Click it to activate your account.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Didn&apos;t receive it? Check your spam folder. The link expires after 24 hours.
          </p>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit" className="w-full">
              Sign out and try a different email
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
