"use client";

import { useMemo, useState } from "react";
import { Button } from "../Button";
import { cn } from "../../utils/cn";

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

type Token = { text: string; className?: string };

function highlightLine(line: string, language: string): Token[] {
  const keywordPattern = /\b(const|let|var|function|return|if|else|for|while|import|from|export|class|interface|type|async|await|true|false|null)\b/g;
  const stringPattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
  const numberPattern = /\b(\d+(?:\.\d+)?)\b/g;
  const commentPattern = language === "bash" ? /(#[^\n]*)/g : /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;

  let tokens: Token[] = [{ text: line }];

  const applyPattern = (pattern: RegExp, className: string): void => {
    tokens = tokens.flatMap((token) => {
      if (token.className) return [token];
      const chunks: Token[] = [];
      let lastIndex = 0;
      const regex = new RegExp(pattern.source, pattern.flags);
      let match = regex.exec(token.text);
      while (match) {
        if (match.index > lastIndex) {
          chunks.push({ text: token.text.slice(lastIndex, match.index) });
        }
        chunks.push({ text: match[0], className });
        lastIndex = match.index + match[0].length;
        match = regex.exec(token.text);
      }
      if (lastIndex < token.text.length) {
        chunks.push({ text: token.text.slice(lastIndex) });
      }
      return chunks;
    });
  };

  applyPattern(commentPattern, "text-text-muted");
  applyPattern(stringPattern, "text-success");
  applyPattern(keywordPattern, "text-primary");
  applyPattern(numberPattern, "text-warning");

  return tokens;
}

export function CodeBlock({ code, language = "text", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => code.split("\n"), [code]);

  async function copyCode(): Promise<void> {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-surface-alt px-3 py-2">
        <div className="text-xs text-text-secondary">
          {filename ? <span>{filename}</span> : null}
          <span className="ml-2 uppercase">{language}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={copyCode}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-text-primary" aria-label="Code block">
        <code>
          {lines.map((line, index) => (
            <div key={`${index}-${line}`} className="whitespace-pre">
              {highlightLine(line, language).map((token, tokenIndex) => (
                <span key={`${tokenIndex}-${token.text}`} className={cn(token.className)}>
                  {token.text}
                </span>
              ))}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
