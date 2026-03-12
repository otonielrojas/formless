import { login, signup } from "@/app/auth/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Formless</h1>
          <p className="mt-2 text-sm text-gray-600">Replace your forms with a conversation.</p>
        </div>

        <form className="space-y-4 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@company.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button formAction={login} className="flex-1">Log in</Button>
            <Button formAction={signup} variant="outline" className="flex-1">Sign up</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
