export default function AIChatCard({ messages }) {
    return (
        <div className="card bg-slate-50 dark:bg-slate-900/30 space-y-2 p-4">
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}>
                    <div
                        className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.role === "ai"
                                ? "bg-white dark:bg-slate-800 border border-slate-200"
                                : "bg-linear-to-r from-cyan-500 to-teal-500 text-white"
                            }`}
                    >
                        {msg.content}
                    </div>
                </div>
            ))}
        </div>
    );
}
