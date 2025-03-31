import { useState, useRef, useEffect } from "react";
import { Mic, StopCircle, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecordRTC from "recordrtc";
import { useAudioAnalyzer } from "./lib/useAudioAnalyzer";

interface AudioFeedback {
  transcript: string;
  feedback: string;
}

interface Message {
  type: 'user' | 'ai';
  content: string;
}

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const audioLevel = useAudioAnalyzer(isRecording, streamRef.current); // Use the custom hook for audio levels

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // // Scroll to response when feedback is received
  // useEffect(() => {
  //   if (feedback && responseRef.current) {
  //     responseRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [feedback]);

  const startRecording = () => {
    setIsRecording(true);
    setFeedback(""); // Clear previous feedback
    setTranscript(""); // Clear previous transcript

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream: MediaStream) => {
      streamRef.current = stream;
      const recorder = new RecordRTC(stream, { type: "audio" });
      recorder.startRecording();
      recorderRef.current = recorder;
    }).catch((error) => {
      console.error("Error accessing media devices:", error);
      setIsRecording(false);
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    recorderRef.current!.stopRecording(() => {
      const blob = recorderRef.current!.getBlob();
      const formData = new FormData();
      formData.append("file", blob, "audio.wav");

      fetch("http://localhost:8000/audio-to-text", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data: AudioFeedback) => {
          console.log(data);
          setTranscript(data.transcript);

          // Add user message to chat history
          if (data.transcript) {
            setMessages(prev => [...prev, { type: 'user', content: data.transcript }]);
          }

          // Add AI response to chat history
          if (data.feedback) {
            setFeedback(data.feedback);
            setMessages(prev => [...prev, { type: 'ai', content: data.feedback }]);
          }

          setIsProcessing(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setFeedback("Error processing audio.");
          setIsProcessing(false);
        });
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-center">How was your day?</h1>
      </div>

      {/* Chat-like messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Message history */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-3 max-w-3xl">
              {message.type === 'ai' && (
                <div className="bg-purple-500 h-8 w-8 rounded-full flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              <div
                className={`rounded-lg p-4 shadow-sm ${message.type === 'user' ? 'bg-blue-100' : 'bg-white'
                  }`}
              >
                <p>{message.content}</p>
              </div>
              {message.type === 'user' && (
                <div className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* User section (recording) */}
        <div className="flex flex-col items-end">
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="bg-blue-100 rounded-lg p-4 shadow-sm">
              <div className="flex flex-col items-center">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`flex items-center justify-center gap-2 min-h-12 min-w-40 relative
                    ${isRecording ? "bg-red-500 hover:bg-red-600" : ""}`}
                >
                  {isRecording ? (
                    <>
                      {/* Stop button aligned to the left */}
                      <StopCircle className="w-5 h-5 absolute left-3" />

                      {/* Waveform container, centered */}
                      <div className="flex items-center space-x-1 h-6 mx-auto">
                        {audioLevel.map((level, index) => (
                          <div
                            key={index}
                            className="w-1 bg-white opacity-80"
                            style={{
                              height: `${Math.max(3, level * 20)}px`,
                            }}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      <span>Start Recording</span>
                    </>
                  )}
                </Button>
                <div className="mt-2 text-xs text-gray-500">
                  {isRecording && (
                    <div className="flex justify-center items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span>Recording...</span>
                    </div>
                  )}
                  {isProcessing && (
                    <div className="w-full mt-2">
                      <div className="text-center mb-1">Processing audio...</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                  )}
                  {transcript !== "" && !messages.some(m => m.type === 'user' && m.content === transcript) && (
                    <p>{transcript}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Response section for current processing */}
        {(feedback && !messages.some(m => m.type === 'ai' && m.content === feedback)) && (
          <div className="flex flex-col items-start" ref={responseRef}>
            <div className="flex items-start gap-3 max-w-3xl">
              <div className="bg-purple-500 h-8 w-8 rounded-full flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p>{feedback}</p>
              </div>
            </div>
          </div>
        )}

        {/* Invisible div for scrolling to the end of the chat */}
        <div ref={chatEndRef}></div>
      </div>
    </div>
  );
}