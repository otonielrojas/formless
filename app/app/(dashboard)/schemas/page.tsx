import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { FormlessSchema } from "@/types/schema";

export default async function SchemasPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user!.id)
    .single();

  const schemas: FormlessSchema[] = [];

  if (membership) {
    const { data } = await supabase
      .from("schemas")
      .select("*")
      .eq("workspace_id", membership.workspace_id)
      .order("created_at", { ascending: false });
    schemas.push(...(data ?? []));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schemas</h1>
          <p className="text-sm text-gray-500 mt-1">Each schema is a form you've replaced with natural language.</p>
        </div>
        <Link href="/schemas/new">
          <Button>New Schema</Button>
        </Link>
      </div>

      {schemas.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 text-sm">No schemas yet.</p>
          <p className="text-gray-400 text-sm mt-1">Create one to get your first intake URL.</p>
          <Link href="/schemas/new">
            <Button className="mt-4" variant="outline">Create your first schema</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {schemas.map((schema) => (
            <div
              key={schema.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-gray-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900">{schema.name}</h2>
                  <Badge variant="secondary">v{schema.version}</Badge>
                </div>
                <p className="text-sm text-gray-500">{schema.description}</p>
                <p className="text-xs text-gray-400 font-mono">
                  Intake URL: /intake/{schema.intake_token}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/intake/${schema.intake_token}`} target="_blank">
                  <Button variant="outline" size="sm">Open Intake</Button>
                </Link>
                <Link href={`/records?schema=${schema.id}`}>
                  <Button variant="ghost" size="sm">Records</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
