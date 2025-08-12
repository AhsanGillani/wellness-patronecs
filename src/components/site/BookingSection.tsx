import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const BookingSection = () => {
  const [date, setDate] = React.useState<Date | undefined>();

  const onBook = () => {
    if (!date) {
      toast({ title: "Select a date", description: "Please choose a preferred date to continue." });
      return;
    }
    toast({ title: "Booking requested", description: `Your appointment request for ${format(date, "PPP")} has been sent.` });
  };

  return (
    <section aria-labelledby="booking" className="container mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <h2 id="booking" className="text-3xl md:text-4xl font-semibold">Book a session</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Pick a date that works for you. We’ll match you with available professionals.
        </p>
      </div>

      <div className="mx-auto max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Select a date</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <span>{date ? format(date, "PPP") : "Pick a date"}</span>
                  <CalendarIcon className="h-4 w-4 opacity-70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
        <Card className="shadow-soft flex flex-col">
          <CardHeader>
            <CardTitle>Confirm</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-muted-foreground">
              {date ? (
                <>Appointment on <span className="font-medium">{format(date, "PPP")}</span>. Click below to request your booking.</>
              ) : (
                <>Choose a date to continue.</>
              )}
            </p>
            <Button variant="hero" size="lg" className="mt-6 self-start" onClick={onBook}>
              Book Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BookingSection;
