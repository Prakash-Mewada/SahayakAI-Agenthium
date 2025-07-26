'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function VisualAidCreator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Aid Creator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Visual Aid Creator Coming Soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
