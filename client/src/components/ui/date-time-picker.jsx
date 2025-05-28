import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function DateTimePicker({mongooseDateTime, onChange}) {
    const initialDate = mongooseDateTime ? new Date(mongooseDateTime) : new Date();

    const [date, setDate] = React.useState(initialDate);
    const [isOpen, setIsOpen] = React.useState(false);
    
    React.useEffect(() => {
        if (date && !isNaN(date.getTime())) {
            onChange(date);
        }
    }, [date]);

    React.useEffect(() => {
        setDate(new Date(mongooseDateTime))
    }, [mongooseDateTime]);

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const handleDateSelect = (selectedDate) => {
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleTimeChange = (type, value) => {
        if (date) {
            const newDate = new Date(date);
            if (type === "hour") {
                newDate.setHours(
                    (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
                );
            } else if (type === "minute") {
                newDate.setMinutes(parseInt(value));
            } else if (type === "ampm") {
                const currentHours = newDate.getHours();
                newDate.setHours(
                    value === "PM" ? currentHours + 12 : currentHours - 12
                );
            }
            setDate(newDate);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal bg-white text-gray-900",
                        !date && "text-gray-500"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date && !isNaN(date.getTime()) ? (
                        format(date, "dd/MM/yyyy hh:mm aa")
                    ) : (
                        <span>DD/MM/YYYY hh:mm aa</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-md">
                <div className="sm:flex">
                    <div className="bg-white">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            initialFocus
                            className="border-r border-gray-200 text-gray-900"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x divide-gray-200 bg-white">
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {hours.reverse().map((hour) => (
                                    <Button
                                        key={hour}
                                        size="icon"
                                        variant={
                                            date && date.getHours() % 12 === hour % 12
                                                ? "default"
                                                : "ghost"
                                        }
                                        className={cn(
                                            "sm:w-full shrink-0 aspect-square text-gray-900",
                                            date && date.getHours() % 12 === hour % 12
                                                ? "bg-gray-100 hover:bg-gray-200"
                                                : "hover:bg-gray-50"
                                        )}
                                        onClick={() => handleTimeChange("hour", hour.toString())}
                                    >
                                        {hour}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                                    <Button
                                        key={minute}
                                        size="icon"
                                        variant={
                                            date && date.getMinutes() === minute
                                                ? "default"
                                                : "ghost"
                                        }
                                        className={cn(
                                            "sm:w-full shrink-0 aspect-square text-gray-900",
                                            date && date.getMinutes() === minute
                                                ? "bg-gray-100 hover:bg-gray-200"
                                                : "hover:bg-gray-50"
                                        )}
                                        onClick={() =>
                                            handleTimeChange("minute", minute.toString())
                                        }
                                    >
                                        {minute.toString().padStart(2, '0')}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="sm:hidden" />
                        </ScrollArea>
                        <ScrollArea className="">
                            <div className="flex sm:flex-col p-2">
                                {["AM", "PM"].map((ampm) => (
                                    <Button
                                        key={ampm}
                                        size="icon"
                                        variant={
                                            date &&
                                                ((ampm === "AM" && date.getHours() < 12) ||
                                                    (ampm === "PM" && date.getHours() >= 12))
                                                ? "default"
                                                : "ghost"
                                        }
                                        className={cn(
                                            "sm:w-full shrink-0 aspect-square text-gray-900",
                                            date &&
                                                ((ampm === "AM" && date.getHours() < 12) ||
                                                    (ampm === "PM" && date.getHours() >= 12))
                                                ? "bg-gray-100 hover:bg-gray-200"
                                                : "hover:bg-gray-50"
                                        )}
                                        onClick={() => handleTimeChange("ampm", ampm)}
                                    >
                                        {ampm}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}