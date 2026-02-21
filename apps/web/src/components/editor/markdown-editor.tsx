'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Textarea } from '@repo/ui/textarea';
import { useState } from 'react';

import { MarkdownViewer } from '@/components/viewer/markdown-viewer';
import { ViewerFrame } from '@/components/viewer/viewer-frame';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export const MarkdownEditor = ({
  value,
  onChange,
}: MarkdownEditorProps) => {
  const [tab, setTab] = useState<string>('edit');

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="edit">編集</TabsTrigger>
        <TabsTrigger value="preview">プレビュー</TabsTrigger>
      </TabsList>
      <TabsContent value="edit">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
        />
      </TabsContent>
      <TabsContent value="preview">
        {value ? (
          <ViewerFrame>
            <MarkdownViewer content={value} />
          </ViewerFrame>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            プレビューする内容がありません
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
};
