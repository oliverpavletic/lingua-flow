import { useState, useRef, useEffect } from "react";
import { Mic, StopCircle, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecordRTC from "recordrtc";

interface AudioFeedback {
  feedback: string;
}

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [audioLevel, setAudioLevel] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Setup audio analyzer when recording starts
  useEffect(() => {
    if (isRecording && streamRef.current) {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(streamRef.current);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateWaveform = () => {
        analyser.getByteFrequencyData(dataArray);

        // Take a subset of frequencies and normalize them for visualization
        const levels = Array.from(dataArray.slice(0, 8)).map(val => val / 255);

        // Add some minimal level to make the waveform visible even in silence
        const minLevel = 0.05;
        const normalizedLevels = levels.map(level => Math.max(level, minLevel));

        setAudioLevel(normalizedLevels);
        animationRef.current = requestAnimationFrame(updateWaveform);
      };

      updateWaveform();
    } else {
      // Clean up animation when recording stops
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isRecording]);

  // Scroll to response when feedback is received
  useEffect(() => {
    if (feedback && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [feedback]);

  const startRecording = () => {
    setIsRecording(true);
    setFeedback(""); // Clear previous feedback

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
          setFeedback(data.feedback);
          setIsProcessing(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          setFeedback("Error processing audio.");
          setIsProcessing(false);
        });
    });
  };

  // For debugging visualization
  useEffect(() => {
    if (isRecording && !analyserRef.current) {
      console.log("Debug: Audio analyzer not initialized");
      // Create mock animation for testing visualization
      let i = 0;
      const mockAnimation = () => {
        i += 0.1;
        const mockLevels = Array(8).fill(0).map((_, idx) =>
          Math.abs(Math.sin(i + idx * 0.4)) * 0.7 + 0.1
        );
        setAudioLevel(mockLevels);
        animationRef.current = requestAnimationFrame(mockAnimation);
      };
      mockAnimation();
    }
  }, [isRecording]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-center">How was your day?</h1>
      </div>

      {/* Chat-like messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
                </div>
              </div>
            </div>
            <div className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Response section */}
        {(feedback || isProcessing) && (
          <div className="flex flex-col items-start" ref={responseRef}>
            <div className="flex items-start gap-3 max-w-3xl">
              <div className="bg-purple-500 h-8 w-8 rounded-full flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                {feedback ? (
                  <p>{feedback}</p>
                ) : (
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
