export interface AudioFeedback {
    transcript: string;
    feedback: string;
}

export interface Message {
    type: 'user' | 'ai';
    content: string;
}
