import { useState } from "react";
import { askAssistant } from "../api";

export default function Assistant() {
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Hi! I'm your AI career advisor. Ask me anything about tech careers, skills, or job roles." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const send = async () => {
        if (!input.trim()) return;
        const userMsg = { role: "user", text: input };
        setMessages(m => [...m, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await askAssistant({ message: input });
            setMessages(m => [...m, { role: "assistant", text: res.data.data.reply }]);
        } catch {
            setMessages(m => [...m, { role: "assistant", text: "Sorry, I couldn't connect to the assistant right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto flex flex-col h-[80vh]">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Career Assistant</h1>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.role === "user"
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-sm text-gray-400 text-sm">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <input
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ask about careers, skills, salaries..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                />
                <button onClick={send} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Send
                </button>
            </div>
        </div>
    );
}