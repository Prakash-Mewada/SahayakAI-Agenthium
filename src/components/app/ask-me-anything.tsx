
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AskMeAnything() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask Me Anything</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Ask Me Anything Coming Soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
