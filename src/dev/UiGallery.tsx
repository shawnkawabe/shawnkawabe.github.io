// shadcn/ui primitives in every variant, hydrated so overlays and focus can be exercised.
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, Mail } from 'lucide-react';
import type { ReactNode } from 'react';

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-mono text-1 tracking-label text-on-surface-3 uppercase">{title}</h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export default function UiGallery() {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-10">
        <Row title="Button · md">
          <Button>Brand</Button>
          <Button variant="neutral">Neutral</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <Button variant="neutral" size="icon" aria-label="Email">
            <Mail strokeWidth={1.5} />
          </Button>
        </Row>
        <Row title="Button · lg">
          <Button size="lg">
            See the work <ArrowRight strokeWidth={1.5} />
          </Button>
          <Button size="lg" variant="neutral">
            Neutral
          </Button>
          <Button size="lg" variant="ghost">
            Ghost
          </Button>
          <Button size="lg" asChild>
            <a href="#top">As link</a>
          </Button>
        </Row>
        <Row title="Badge">
          <Badge>Neutral</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="error">Error</Badge>
        </Row>
        <Row title="Fields">
          <div className="grid w-full max-w-180 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="g-name">Label + input</Label>
              <Input id="g-name" placeholder="Your name" />
            </div>
            <Field>
              <FieldLabel htmlFor="g-email">Field with description</FieldLabel>
              <Input id="g-email" type="email" placeholder="you@example.com" />
              <FieldDescription>Used only to reply.</FieldDescription>
            </Field>
            <Field data-invalid="true">
              <FieldLabel htmlFor="g-bad">Invalid field</FieldLabel>
              <Input id="g-bad" aria-invalid="true" defaultValue="not-an-email" />
              <FieldError>Enter a valid email address.</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="g-disabled">Disabled</FieldLabel>
              <Input id="g-disabled" disabled placeholder="Unavailable" />
            </Field>
            <Field>
              <FieldLabel htmlFor="g-type">Select</FieldLabel>
              <Select>
                <SelectTrigger id="g-type" className="w-full">
                  <SelectValue placeholder="Project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="implementation">Implementation</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="audit">Org audit</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="g-msg">Textarea</FieldLabel>
              <Textarea id="g-msg" placeholder="Tell me about the project" />
            </Field>
          </div>
        </Row>
        <Row title="Overlays">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="neutral">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog title</DialogTitle>
                <DialogDescription>Focus is trapped; Escape closes.</DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton />
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="neutral">Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Sheet title</SheetTitle>
                <SheetDescription>Used by the mobile navigation.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost">Hover or focus me</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </Row>
      </div>
    </TooltipProvider>
  );
}
