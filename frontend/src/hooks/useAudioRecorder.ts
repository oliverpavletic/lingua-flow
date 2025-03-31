import { useState, useRef } from "react";
import RecordRTC from "recordrtc";
import { AudioFeedback } from "../types";

export function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [feedback, setFeedback] = useState("");
    const recorderRef = useRef<RecordRTC | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const getStream = () => streamRef.current;

    const startRecording = () => {
        setIsRecording(true);
        setFeedback("");
        setTranscript("");

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
                    setTranscript(data.transcript);
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

    return {
        isRecording,
        isProcessing,
        transcript,
        feedback,
        startRecording,
        stopRecording,
        getStream
    };
}
