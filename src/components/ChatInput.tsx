import { useRef, useState } from 'react';
import { ArrowUp, Lock, Plus, Mic, MicOff, Paperclip, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFileToWP, transcribeAudioWP, isWordPress } from '@/lib/wp-api';

const MODELS = [
  { label: 'GPT-4o', value: 'gpt-4o', group: 'OpenAI' },
  { label: 'GPT-4o Mini', value: 'gpt-4o-mini', group: 'OpenAI' },
  { label: 'GPT-4', value: 'gpt-4', group: 'OpenAI' },
  { label: 'Claude Sonnet 4', value: 'claude-sonnet-4-20250514', group: 'Anthropic' },
  { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022', group: 'Anthropic' },
  { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro-latest', group: 'Google' },
  { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash-latest', group: 'Google' },
  { label: 'DeepSeek Chat', value: 'deepseek-chat', group: 'DeepSeek' },
  { label: 'Llama 3.1 70B', value: 'llama-3.1-70b-versatile', group: 'Groq' },
  { label: 'Mistral Large', value: 'mistral-large-latest', group: 'Mistral' },
];

interface ChatInputProps {
  onSend: (message: string, attachment?: { url: string; type: string; data?: string } | null, model?: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadedAttachment, setUploadedAttachment] = useState<{ url: string; type: string; data?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [modelOpen, setModelOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (disabled || isUploading || isTranscribing) return;

    const cleanMessage = message.trim();
    if (!cleanMessage && !attachedFile) {
      toast.error('Type a message or attach a file first');
      return;
    }

    const payload = [
      isPrivateMode ? '[Private mode enabled]' : '',
      cleanMessage,
    ]
      .filter(Boolean)
      .join('\n\n');

    onSend(payload, uploadedAttachment, selectedModel);
    setMessage('');
    setAttachedFile(null);
    setUploadedAttachment(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    setAttachedFile(file);

    if (isWordPress()) {
      setIsUploading(true);
      try {
        const result = await uploadFileToWP(file);
        setUploadedAttachment({
          url: result.file_url,
          type: result.file_type,
          data: result.file_data,
        });
        toast.success(`Uploaded: ${result.file_name}`);
      } catch (err: any) {
        toast.error(err.message || 'Upload failed');
        setAttachedFile(null);
      } finally {
        setIsUploading(false);
      }
    } else {
      toast.success(`Attached: ${file.name}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    setUploadedAttachment(null);
  };

  const handleTogglePrivate = () => {
    setIsPrivateMode((prev) => {
      const next = !prev;
      toast.success(next ? 'Private mode enabled' : 'Private mode disabled');
      return next;
    });
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        if (isWordPress()) {
          setIsTranscribing(true);
          try {
            const text = await transcribeAudioWP(audioBlob);
            setMessage((prev) => (prev ? prev + ' ' + text : text));
            toast.success('Transcription complete');
          } catch (err: any) {
            toast.error(err.message || 'Transcription failed');
          } finally {
            setIsTranscribing(false);
          }
        } else {
          toast.info('Voice transcription requires WordPress backend');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording... click mic again to stop');
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const currentModelLabel = MODELS.find(m => m.value === selectedModel)?.label || 'GPT-4o';

  return (
    <div className="w-full max-w-[720px] mx-auto px-4">
      <div
        className="bg-chat-input border border-border rounded-2xl overflow-hidden
                   shadow-lg shadow-black/20 transition-shadow focus-within:shadow-xl focus-within:border-primary/20"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain"
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={isRecording ? 'Recording...' : isTranscribing ? 'Transcribing...' : 'Ask your AI personas anything'}
          rows={1}
          disabled={disabled || isTranscribing}
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground
                     px-4 pt-4 pb-2 text-sm resize-none focus:outline-none
                     disabled:opacity-50 min-h-[44px] max-h-[200px]"
        />

        {attachedFile && (
          <div className="px-3 pb-1 flex items-center gap-2">
            <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground truncate flex-1">
              {isUploading ? 'Uploading...' : attachedFile.name}
            </p>
            <button onClick={handleRemoveAttachment} className="p-0.5 rounded hover:bg-muted transition-colors">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-3 pb-3">
          {/* Model selector */}
          <div className="relative" ref={modelDropdownRef}>
            <button
              type="button"
              onClick={() => setModelOpen(prev => !prev)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
                         text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {currentModelLabel}
              <ChevronDown className={`w-3 h-3 transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
            </button>

            {modelOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setModelOpen(false)} />
                <div className="absolute bottom-full left-0 mb-1 z-50 w-56
                                bg-popover border border-border rounded-xl shadow-xl
                                max-h-64 overflow-y-auto py-1">
                  {MODELS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => { setSelectedModel(m.value); setModelOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors
                        ${m.value === selectedModel
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted'
                        }`}
                    >
                      <span className="font-medium">{m.label}</span>
                      <span className="text-muted-foreground ml-1.5">· {m.group}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAttachClick}
              disabled={isUploading}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleMicToggle}
              disabled={isTranscribing}
              className={`p-2 rounded-lg transition-colors ${
                isRecording
                  ? 'text-destructive bg-destructive/10 animate-pulse'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              } disabled:opacity-30`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleTogglePrivate}
              className={`p-2 rounded-lg transition-colors
                ${isPrivateMode
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <Lock className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={disabled || isUploading || isTranscribing}
              className="p-2 rounded-full bg-primary text-primary-foreground
                         hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100
                         transition-all duration-150 active:scale-95"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
