import { User, Bot } from "lucide-react";
import { Message } from "../types";

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.type === 'user';

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className="flex items-start gap-3 max-w-3xl">
                {!isUser && (
                    <div className="bg-purple-500 h-8 w-8 rounded-full flex items-center justify-center text-white">
                        <Bot className="w-5 h-5" />
                    </div>
                )}
                <div className={`rounded-lg p-4 shadow-sm ${isUser ? 'bg-blue-100' : 'bg-white'}`}>
                    <p>{message.content}</p>
                </div>
                {isUser && (
                    <div className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center text-white">
                        <User className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
}