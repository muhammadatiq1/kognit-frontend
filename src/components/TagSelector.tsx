import React, { useState, useEffect, useRef } from 'react';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, X, Tag as TagIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const { token } = useAuth();
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/tags', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableTags(data);
      })
      .catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTags = availableTags.filter(t => selectedTagIds.includes(t.id));
  const filteredTags = availableTags.filter(t => t.name.toLowerCase().includes(inputValue.toLowerCase()));
  const exactMatch = availableTags.find(t => t.name.toLowerCase() === inputValue.toLowerCase());

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
    setInputValue('');
  };

  const handleCreateTag = async () => {
    if (!inputValue.trim() || !token) return;
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/tags', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: inputValue.trim(),
          color: getRandomColor()
        })
      });
      
      if (res.ok) {
        const newTag = await res.json();
        setAvailableTags(prev => [...prev, newTag]);
        onChange([...selectedTagIds, newTag.id]);
        setInputValue('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="min-h-10 p-1.5 border border-input rounded-md flex flex-wrap gap-1.5 items-center bg-background cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onClick={() => setIsOpen(true)}
      >
        {selectedTags.length > 0 ? (
          selectedTags.map(tag => (
            <Badge 
              key={tag.id} 
              variant="secondary"
              className="px-2 py-0.5 text-xs font-medium flex items-center gap-1 hover:opacity-80"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40`, borderWidth: 1 }}
            >
              {tag.name}
              <button 
                type="button"
                className="ml-1 rounded-full p-0.5 hover:bg-black/10 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleTag(tag.id);
                }}
              >
                <X size={10} />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm px-2 py-1 flex items-center gap-2">
            <TagIcon size={14} /> Add tags...
          </span>
        )}
        
        <input
          type="text"
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm px-2 py-1 text-foreground placeholder:text-muted-foreground"
          placeholder={selectedTags.length > 0 ? "Add more..." : ""}
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' && inputValue) {
              e.preventDefault();
              if (exactMatch) {
                if (!selectedTagIds.includes(exactMatch.id)) {
                  handleToggleTag(exactMatch.id);
                }
              } else {
                handleCreateTag();
              }
            } else if (e.key === 'Backspace' && !inputValue && selectedTagIds.length > 0) {
              onChange(selectedTagIds.slice(0, -1));
            }
          }}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-popover text-popover-foreground rounded-md border shadow-md z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleToggleTag(tag.id)}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      {isSelected && <Check size={14} className="text-primary" />}
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                    <span className="flex-1">{tag.name}</span>
                  </div>
                );
              })
            ) : (
              inputValue.length === 0 && <div className="p-3 text-center text-sm text-muted-foreground">Type to search or create tags.</div>
            )}

            {inputValue.length > 0 && !exactMatch && (
              <div 
                className="flex items-center gap-2 px-2 py-2 text-sm rounded-sm bg-primary/5 hover:bg-primary/10 text-primary cursor-pointer mt-1 border-t border-border/50"
                onClick={handleCreateTag}
              >
                {loading ? (
                  <span className="flex items-center gap-2">Creating...</span>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Create "<span className="font-semibold">{inputValue}</span>"</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getRandomColor() {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', 
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', 
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
