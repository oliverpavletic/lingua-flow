import { Mic, StopCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  startRecording: () => void;
  stopRecording: () => void;
}

export function RecordingControls({
  isRecording,
  isProcessing,
  transcript,
  startRecording,
  stopRecording,
}: RecordingControlsProps) {
  return (
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
                  <div className="flex items-center justify-center gap-1 h-12">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="flex items-end">
                        <div
                          className="w-1 bg-white opacity-80 rounded-full origin-bottom animate-waveform"
                          style={{
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      </div>
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
              {transcript !== "" && (
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
  );
}