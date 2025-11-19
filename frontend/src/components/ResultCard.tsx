import { useState } from "react";
import { SourceDTO } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AuthorityBadge } from "./AuthorityBadge";
import { ConfidenceBar } from "./ConfidenceBar";
import { MetadataTags } from "./MetadataTags";

interface ResultCardProps {
  source: SourceDTO;
  onSave: (source: SourceDTO) => void;
  isSaved: boolean;
}

export function ResultCard({ source, onSave, isSaved }: ResultCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {source.title}
          </a>
        </CardTitle>
        <CardDescription>{source.url}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-2">
          <AuthorityBadge confidence={source.confidence} />
        </div>
        <ConfidenceBar confidence={source.confidence} />
        {source.metadata && <MetadataTags metadata={source.metadata} />}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Why this ranking?</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reasoning for Ranking</DialogTitle>
              <DialogDescription>
                {source.reasoning}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Button onClick={() => onSave(source)} disabled={isSaved} size="sm">
          {isSaved ? "Saved" : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
