import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-2">Contact Us</h1>
      <p className="text-text-secondary mb-10">Have a question or want to learn more? Reach out to our team.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="border-border/60 shadow-none">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-text-primary text-sm">Email</h3>
            <a href="mailto:hello@anand.sa" className="text-sm text-primary hover:underline mt-1">hello@anand.sa</a>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-none">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-text-primary text-sm">Phone</h3>
            <p className="text-sm text-text-secondary mt-1">+966 11 XXX XXXX</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-none">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-text-primary text-sm">Office</h3>
            <p className="text-sm text-text-secondary mt-1">Riyadh, Saudi Arabia</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">Send us a message</CardTitle>
          <CardDescription>We typically respond within one business day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-sm font-medium">Name</Label>
              <Input id="contactName" placeholder="Your name" className="h-10 border-border/60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-sm font-medium">Email</Label>
              <Input id="contactEmail" type="email" placeholder="you@company.com" className="h-10 border-border/60" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactSubject" className="text-sm font-medium">Subject</Label>
            <Input id="contactSubject" placeholder="How can we help?" className="h-10 border-border/60" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactMessage" className="text-sm font-medium">Message</Label>
            <textarea
              id="contactMessage"
              rows={4}
              placeholder="Tell us more about your inquiry..."
              className="flex w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-none"
            />
          </div>
          <Button className="h-10 font-medium shadow-none">Send Message</Button>
        </CardContent>
      </Card>
    </div>
  );
}
