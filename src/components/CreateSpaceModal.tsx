"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpaceCreated: (space: any) => void;
}

export function CreateSpaceModal({ isOpen, onClose, onSpaceCreated }: CreateSpaceModalProps) {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !token) return;

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, isPrivate })
      });

      if (res.ok) {
        const space = await res.json();
        onSpaceCreated(space);
        setName('');
        setDescription('');
        setIsPrivate(false);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Create a Space</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            A Space represents teams, departments, or groups, each with its own Lists, workflows, and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Icon & name</label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-border bg-muted/50 flex items-center justify-center shrink-0">
                <span className="text-muted-foreground font-medium">
                  {name ? name.charAt(0).toUpperCase() : 'S'}
                </span>
              </div>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marketing, Engineering, HR"
                className="bg-transparent border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent border-border text-foreground min-h-[80px] focus-visible:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Default permission</span>
            </div>
            <Select defaultValue="full">
              <SelectTrigger className="w-32 h-8 bg-transparent border-border text-foreground">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="full">Full edit</SelectItem>
                <SelectItem value="view">View only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                Make Private
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Only you and invited members have access
              </p>
            </div>
            <Switch 
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <DialogFooter className="border-t border-border pt-4 mt-6">
            <div className="w-full flex items-center justify-between">
              <Button type="button" variant="ghost" className="text-muted-foreground hover:text-foreground">
                Use Templates
              </Button>
              <Button type="submit" disabled={submitting || !name.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6">
                Continue
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
