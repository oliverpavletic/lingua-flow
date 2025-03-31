import { useState, useRef, useEffect } from "react";
import { Header } from "./components/Header";
import { MessageList } from "./components/MessageList";
import { RecordingControls } from "./components/RecordingControls";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { Message } from "./types";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    isRecording,
    isProcessing,
    transcript,
    feedback,
    startRecording,
    stopRecording,
    getStream
  } = useAudioRecorder();

  // Track when we've processed the current transcript/feedback
  const [processedTranscript, setProcessedTranscript] = useState("");
  const [processedFeedback, setProcessedFeedback] = useState("");

  // Handle transcript update
  useEffect(() => {
    if (transcript && transcript !== processedTranscript && !isProcessing) {
      setMessages(prev => [...prev, { type: 'user', content: transcript }]);
      setProcessedTranscript(transcript);
    }
  }, [transcript, processedTranscript, isProcessing]);

  // Handle feedback update
  useEffect(() => {
    if (feedback && feedback !== processedFeedback && !isProcessing) {
      setMessages(prev => [...prev, { type: 'ai', content: feedback }]);
      setProcessedFeedback(feedback);
    }
  }, [feedback, processedFeedback, isProcessing]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Reset processed states when recording starts
  useEffect(() => {
    if (isRecording) {
      setProcessedTranscript("");
      setProcessedFeedback("");
    }
  }, [isRecording]);

  // Calculate if transcript should be displayed in the recording bubble
  const displayedTranscript = transcript !== processedTranscript ? transcript : "";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <MessageList messages={messages} />

        <RecordingControls
          isRecording={isRecording}
          isProcessing={isProcessing}
          transcript={displayedTranscript}
          startRecording={startRecording}
          stopRecording={stopRecording}
          getStream={getStream}
        />

        <div ref={chatEndRef}></div>
      </div>
    </div>
  );
}