import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

interface WebhookDelivery {
  id: string;
  schema_id: string;
  record_id: string | null;
  webhook_url: string;
  status: "success" | "failed";
  http_status: number | null;
  attempts: number;
  error: string | null;
  created_at: string;
  schemas: { name: string } | null;
}

export default async function WebhooksPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user!.id)
    .single();

  let deliveries: WebhookDelivery[] = [];

  if (membership) {
    const { data: schemas } = await supabase
      .from("schemas")
      .select("id")
      .eq("workspace_id", membership.workspace_id);

    const schemaIds = (schemas ?? []).map((s: { id: string }) => s.id);

    if (schemaIds.length > 0) {
      const { data } = await supabase
        .from("webhook_deliveries")
        .select("*, schemas(name)")
        .in("schema_id", schemaIds)
        .order("created_at", { ascending: false })
        .limit(100);

      deliveries = (data ?? []) as WebhookDelivery[];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Webhook Deliveries</h1>
        <p className="text-sm text-gray-500 mt-1">
          Last 100 webhook delivery attempts across all schemas.
        </p>
      </div>

      {deliveries.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 text-sm">No deliveries yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Add a webhook URL to a schema and submit an intake to see deliveries here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Schema</th>
                <th className="px-4 py-3">Webhook URL</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">HTTP</th>
                <th className="px-4 py-3">Attempts</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {d.schemas?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs max-w-[220px] truncate">
                    {d.webhook_url}
                  </td>
                  <td className="px-4 py-3">
                    {d.status === "success" ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        success
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100" title={d.error ?? ""}>
                        failed
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {d.http_status ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{d.attempts}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(d.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
