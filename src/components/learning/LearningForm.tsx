import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, X, FileJson } from 'lucide-react';
import { Tag, LearningTopic, Subtopic } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const availableTags: { value: Tag; label: string }[] = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'dsa', label: 'DSA' },
  { value: 'devops', label: 'DevOps' },
  { value: 'system-design', label: 'System Design' },
  { value: 'other', label: 'Other' },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const LearningForm: React.FC = () => {
  const { addLearningTopic } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [newSubtopic, setNewSubtopic] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [importMode, setImportMode] = useState<'manual' | 'json'>('manual');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addLearningTopic({
      title,
      description,
      tags: selectedTags,
      subtopics,
      timeSpent: 0,
    });

    resetForm();
    setOpen(false);
    toast.success('Topic added successfully!');
  };

  const handleJsonImport = () => {
    try {
      const data = JSON.parse(jsonInput);
      
      // Support both single topic and array of topics
      const topics = Array.isArray(data) ? data : [data];
      
      for (const topic of topics) {
        if (!topic.title) {
          toast.error('Each topic must have a title');
          return;
        }
        
        const subtopicsData: Subtopic[] = (topic.subtopics || []).map((st: string | { title: string }) => ({
          id: generateId(),
          title: typeof st === 'string' ? st : st.title,
          completed: false,
        }));

        addLearningTopic({
          title: topic.title,
          description: topic.description || '',
          tags: (topic.tags || []).filter((t: string) => availableTags.some(at => at.value === t)) as Tag[],
          subtopics: subtopicsData,
          timeSpent: topic.timeSpent || 0,
        });
      }
      
      toast.success(`Successfully imported ${topics.length} topic(s)!`);
      resetForm();
      setOpen(false);
    } catch {
      toast.error('Invalid JSON format. Please check your input.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedTags([]);
    setSubtopics([]);
    setNewSubtopic('');
    setJsonInput('');
    setImportMode('manual');
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addSubtopic = () => {
    if (newSubtopic.trim()) {
      setSubtopics([
        ...subtopics,
        { id: generateId(), title: newSubtopic.trim(), completed: false },
      ]);
      setNewSubtopic('');
    }
  };

  const removeSubtopic = (id: string) => {
    setSubtopics(subtopics.filter((st) => st.id !== id));
  };

  const exampleJson = `{
  "title": "React Hooks",
  "description": "Learn all React hooks",
  "tags": ["frontend"],
  "subtopics": [
    "useState",
    "useEffect",
    "useContext",
    "useReducer"
  ]
}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Learning Topic</DialogTitle>
        </DialogHeader>
        
        <Tabs value={importMode} onValueChange={(v) => setImportMode(v as 'manual' | 'json')}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="manual" className="flex-1">Manual Entry</TabsTrigger>
            <TabsTrigger value="json" className="flex-1 gap-2">
              <FileJson className="w-4 h-4" />
              JSON Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Topic Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., React Hooks, Binary Search"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What do you want to learn about this topic?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => toggleTag(tag.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                        selectedTags.includes(tag.value)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subtopics</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a subtopic..."
                    value={newSubtopic}
                    onChange={(e) => setNewSubtopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubtopic();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addSubtopic}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {subtopics.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {subtopics.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                      >
                        <span className="text-sm">{st.title}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubtopic(st.id)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Topic</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-input">Paste JSON</Label>
              <Textarea
                id="json-input"
                placeholder={exampleJson}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium mb-2">JSON Format:</p>
              <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
{`{
  "title": "Topic Name",
  "description": "Optional description",
  "tags": ["frontend", "backend"],
  "subtopics": ["Subtopic 1", "Subtopic 2"]
}

// Or import multiple topics:
[
  { "title": "Topic 1", "subtopics": [...] },
  { "title": "Topic 2", "subtopics": [...] }
]`}
              </pre>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleJsonImport} disabled={!jsonInput.trim()}>
                Import Topics
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
