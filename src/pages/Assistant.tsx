import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { toast } from 'sonner';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([{ id: '1', role: 'assistant', content: "Hello! I'm your AI learning assistant powered by Gemini. I can help you understand concepts, solve problems, and answer questions about your courses. What would you like to learn today?" }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: subjects } = useSubjects();

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';
    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id.startsWith('stream-')) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { id: 'stream-' + Date.now(), role: 'assistant', content: assistantContent }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })), subjectContext: subjects?.find(s => s.id === selectedSubject)?.name }),
      });
      
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get response');
      }

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ') || line.startsWith(':')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) upsertAssistant(c); } catch {}
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to connect');
      setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">AI Assistant<Badge variant="secondary" className="text-xs">Gemini</Badge></h1><p className="text-muted-foreground">Get help with your coursework</p></div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}><SelectTrigger className="w-[200px]"><SelectValue placeholder="Select subject context" /></SelectTrigger><SelectContent>{subjects?.filter(s => s.is_active).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <Card className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback></Avatar>}
                  <div className={`max-w-[70%] rounded-lg px-4 py-2 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><p className="text-sm whitespace-pre-wrap">{m.content}</p></div>
                  {m.role === 'user' && <Avatar className="h-8 w-8"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && <div className="flex gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback></Avatar><div className="bg-muted rounded-lg px-4 py-2"><div className="flex gap-1"><span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span></div></div></div>}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t"><div className="flex gap-2"><Input placeholder="Ask a question..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={isLoading} /><Button onClick={handleSend} disabled={!input.trim() || isLoading}><Send className="h-4 w-4" /></Button></div></div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
