import { useParams } from "wouter";
import { useGetDisplayData, getGetDisplayDataQueryKey } from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import { formatWaitTime } from "@/lib/utils";
import { Clock, Users, MonitorPlay } from "lucide-react";

export default function DisplayScreen() {
  const { queueId } = useParams<{ queueId: string }>();
  const id = parseInt(queueId || "0");
  const [prevServing, setPrevServing] = useState<string>("");
  const [flashNew, setFlashNew] = useState(false);

  const { data, isLoading } = useGetDisplayData(id, {
    query: {
      enabled: !!id,
      queryKey: getGetDisplayDataQueryKey(id),
      refetchInterval: 8000,
    },
  });

  useEffect(() => {
    if (data && data.currentlyServing !== prevServing && prevServing !== "") {
      setFlashNew(true);
      setTimeout(() => setFlashNew(false), 3000);
    }
    if (data) setPrevServing(data.currentlyServing);
  }, [data?.currentlyServing]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col select-none">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MonitorPlay className="w-6 h-6 text-primary" />
          <div>
            <div className="font-bold text-lg">{data?.queueName || "Loading..."}</div>
            <div className="text-xs text-gray-400">Virtual Queue Display</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono">{timeStr}</div>
          <div className={`text-xs font-medium mt-0.5 ${
            data?.status === "active" ? "text-green-400" :
            data?.status === "paused" ? "text-yellow-400" : "text-gray-400"
          }`}>
            {data?.status === "active" ? "● OPEN" : data?.status === "paused" ? "⏸ PAUSED" : "● CLOSED"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 text-xl animate-pulse">Loading display...</div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* NOW SERVING - Left / Top */}
          <div className={`flex-1 flex flex-col items-center justify-center p-12 transition-all duration-700 ${flashNew ? "bg-primary/20" : "bg-gray-950"}`}>
            <div className="text-gray-400 text-xl font-semibold tracking-widest uppercase mb-6">Now Serving</div>
            <div className={`text-[10rem] font-black tracking-tighter leading-none transition-all duration-500 ${flashNew ? "text-white scale-110" : "text-primary"}`}>
              {data?.currentlyServing || "---"}
            </div>
            {flashNew && (
              <div className="mt-6 px-6 py-2 bg-primary rounded-full text-white font-bold animate-bounce">
                Please proceed to the counter
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
            {/* Wait info */}
            <div className="p-6 border-b border-gray-800">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-4xl font-bold">{data?.waitingCount || 0}</div>
                  <div className="text-xs text-gray-400 mt-1">Waiting</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 text-center">
                  <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-4xl font-bold">{data?.estimatedWaitMinutes || 0}</div>
                  <div className="text-xs text-gray-400 mt-1">Min Wait</div>
                </div>
              </div>
            </div>

            {/* Recently Called */}
            <div className="flex-1 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-4">Recently Called</div>
              <div className="space-y-2">
                {(data?.recentlyCalled || []).length === 0 ? (
                  <div className="text-gray-600 text-sm">None yet</div>
                ) : (
                  (data?.recentlyCalled || []).map((token, i) => (
                    <div
                      key={i}
                      className={`text-center py-3 rounded-lg font-mono text-2xl font-bold ${
                        i === 0
                          ? "bg-gray-700 text-white"
                          : "bg-gray-800/50 text-gray-400"
                      }`}
                    >
                      {token}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 text-center">
              <div className="text-xs text-gray-600">SmartQueue AI · Auto-refreshing</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
