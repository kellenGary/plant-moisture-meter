'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void> | void;
  className?: string;
  textClassName?: string;
  placeholder?: string;
}

export function EditableText({
  value,
  onSave,
  className,
  textClassName,
  placeholder = 'Enter name...'
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmedValue = currentValue.trim();
    if (trimmedValue && trimmedValue !== value) {
      setIsSaving(true);
      try {
        await onSave(trimmedValue);
      } catch (error) {
        console.error('Failed to save:', error);
        // Revert on error
        setCurrentValue(value);
      } finally {
        setIsSaving(false);
        setIsEditing(false);
      }
    } else {
      // Revert if empty or unchanged
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-1", className)} onClick={(e) => e.stopPropagation()}>
        <Input
          ref={inputRef}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSaving}
          className={cn("h-7 px-2 py-1 text-sm bg-background w-full min-w-[120px]", textClassName)}
        />
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7 shrink-0 text-green-500 hover:text-green-600 hover:bg-green-500/10" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
          onClick={() => {
            setCurrentValue(value);
            setIsEditing(false);
          }}
          disabled={isSaving}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={cn("group flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md px-1 -mx-1 transition-colors", className)} 
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      <span className={cn("truncate", textClassName)}>
        {value}
      </span>
      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground shrink-0" />
    </div>
  );
}
