import { signup } from "@/app/auth/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Formless</h1>
          <p className="mt-2 text-sm text-gray-600">Create your account.</p>
        </div>

        {searchParams.error && (
          <p className="text-sm text-center text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {searchParams.error}
          </p>
        )}

        <form className="space-y-4 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@company.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" minLength={8} />
            <p className="text-xs text-gray-400">Minimum 8 characters</p>
          </div>

          <Button type="submit" formAction={signup} className="w-full">Create account</Button>

          <p className="text-xs text-center text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-gray-600 hover:text-gray-900 underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
