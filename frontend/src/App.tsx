import { useState, useRef } from "react";
import { Mic, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecordRTC from "recordrtc";

interface AudioFeedback {
  feedback: string;
}

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState("");
  const recorderRef = useRef<RecordRTC | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream: MediaStream) => {
      const recorder = new RecordRTC(stream, { type: "audio" });
      recorder.startRecording();
      recorderRef.current = recorder;
    }).catch((error) => {
      console.error("Error accessing media devices:", error);
    });;
  };

  const stopRecording = () => {
    setIsRecording(false);
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
          setFeedback(data.feedback); // Assuming the backend returns { "feedback": "Your response was great!" }
        })
        .catch((error) => {
          console.error("Error:", error);
          setFeedback("Error processing audio.");
        });

    });
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md text-center">
        <h1 className="text-xl font-semibold mb-4">How was your day?</h1>
        <Button onClick={isRecording ? stopRecording : startRecording} className="mt-4 flex items-center gap-2">
          {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
        {feedback && <p className="mt-4 text-green-600">{feedback}</p>}
      </div>
    </div>
  );
}
