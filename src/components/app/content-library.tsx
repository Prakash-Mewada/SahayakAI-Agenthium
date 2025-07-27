
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface HistoryItem {
  id: string;
  content: string;
  date: string;
}

export function ContentLibrary() {
  const { toast } = useToast();
  const [library, setLibrary] = useState<HistoryItem[]>([]);

  const fetchLibrary = () => {
    try {
      const savedContent = localStorage.getItem('sahayakLibrary');
      if (savedContent) {
        setLibrary(JSON.parse(savedContent));
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Failed to load library',
        description: 'Could not retrieve saved content from local storage.',
      });
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleDelete = (id: string) => {
    try {
      const updatedLibrary = library.filter(item => item.id !== id);
      setLibrary(updatedLibrary);
      localStorage.setItem('sahayakLibrary', JSON.stringify(updatedLibrary));
      toast({ title: 'Content removed from library.' });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Failed to remove content',
      });
    }
  };

  const formatContent = (text: string) => {
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\\n/g, '<br />');
    return html;
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {library.length > 0 ? (
        library.map(item => (
          <Card key={item.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>Content from {new Date(item.date).toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-48">
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: formatContent(item.content) }}
                />
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-full text-center text-muted-foreground">
          <p>Your content library is empty. Saved content will appear here.</p>
        </div>
      )}
    </div>
  );
}
