import { createClient } from "@/lib/supabase/server";
import { RecordStatus } from "@/components/record-status";
import type { FormlessRecord } from "@/types/schema";

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: { schema?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user!.id)
    .single();

  const records: (FormlessRecord & { schemas: { name: string } })[] = [];

  if (membership) {
    let query = supabase
      .from("records")
      .select("*, schemas(name)")
      .eq("workspace_id", membership.workspace_id)
      .order("created_at", { ascending: false });

    if (searchParams.schema) {
      query = query.eq("schema_id", searchParams.schema);
    }

    const { data } = await query;
    records.push(...(data ?? []));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Records</h1>
        <p className="text-sm text-gray-500 mt-1">All intake submissions across your schemas.</p>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-500">No records yet.</p>
          <p className="text-sm text-gray-400 mt-1">Submissions will appear here once users submit via an intake URL.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white border border-gray-200 rounded-xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{record.schemas?.name}</span>
                  <RecordStatus recordId={record.id} status={record.status} />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(record.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 italic">
                "{record.raw_input}"
              </p>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(record.extracted_data).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-gray-400 font-medium uppercase tracking-wide">{key.replace(/_/g, " ")}</span>
                    <p className="text-gray-800 mt-0.5">
                      {value === null ? <span className="text-gray-300">—</span> : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
