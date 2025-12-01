/** @format */

"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { countries, type Country } from "@/lib/countries";
import { toast } from "sonner";
import { useProfile, type TravelCountryData } from "@/hooks/useProfile";

interface AvailableCountryProps {
    onUpdate?: () => void;
}

const haveSameCountries = (a: Country[], b: Country[]) => {
    if (a.length !== b.length) return false;
    const codes = new Set(a.map((c) => c.code));
    return b.every((country) => codes.has(country.code));
};

export default function AvalableCountryForTravel({ onUpdate }: AvailableCountryProps) {
    const { travelCountries: apiTravelCountries, addTravelCountry, deleteTravelCountry, fetchTravelCountries } = useProfile();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [visaCountries, setVisaCountries] = useState<Country[]>([]);
    const [tempCountries, setTempCountries] = useState<Country[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [markAll, setMarkAll] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load travel countries from API
    useEffect(() => {
        if (apiTravelCountries) {
            const countryObjects: Country[] = apiTravelCountries
                .map(tc => {
                    // Try to find the country in our countries list
                    const country = countries.find(c => 
                        c.name.toLowerCase() === tc.country_name.toLowerCase() ||
                        c.code === tc.country_name
                    );
                    return country;
                })
                .filter((c): c is Country => c !== undefined);
            
            setVisaCountries(countryObjects);
            setTempCountries(countryObjects);
            setMarkAll(haveSameCountries(countryObjects, countries));
        }
    }, [apiTravelCountries]);

    const handleOpenDialog = () => {
        const savedMarkAll = haveSameCountries(visaCountries, countries);
        setTempCountries(savedMarkAll ? countries : [...visaCountries]);
        setMarkAll(savedMarkAll);
        setSearchQuery("");
        setIsDialogOpen(true);
    };

    const handleSelectCountry = (country: Country) => {
        if (markAll) return;
        setTempCountries((prev) =>
            prev.find((c) => c.code === country.code) ? prev : [...prev, country]
        );
        setSearchQuery("");
    };

    const handleRemoveCountry = (countryCode: string) => {
        setTempCountries((prev) => prev.filter((c) => c.code !== countryCode));
    };

    const handleAddCountryFromSearch = () => {
        if (!searchQuery.trim()) {
            toast.info("Type a country name first.");
            return;
        }
        const exactMatch = countries.find(
            (country) => country.name.toLowerCase() === searchQuery.trim().toLowerCase()
        );
        const candidate = exactMatch || filteredCountries[0];

        if (!candidate) {
            toast.error("No matching country found.");
            return;
        }

        handleSelectCountry(candidate);
    };

    const handleMarkAllToggle = (checked: boolean) => {
        setMarkAll(checked);
        if (checked) {
            setTempCountries(countries);
            setSearchQuery("");
        }
    };

    const handleSave = async () => {
        const nextCountries = markAll ? countries : tempCountries;
        const nextMarkAll = haveSameCountries(nextCountries, countries);
        const prevMarkAll = haveSameCountries(visaCountries, countries);

        if (nextMarkAll === prevMarkAll && haveSameCountries(visaCountries, nextCountries)) {
            toast.info("No changes were made.");
            setIsDialogOpen(false);
            return;
        }

        setSaving(true);
        try {
            // Find countries to add (in next but not in current)
            const countriesToAdd = nextCountries.filter(nc => 
                !visaCountries.find(vc => vc.code === nc.code)
            );
            
            // Find countries to delete (in current but not in next)
            const countriesToDelete = visaCountries.filter(vc => 
                !nextCountries.find(nc => nc.code === vc.code)
            );

            // Delete removed countries
            for (const country of countriesToDelete) {
                const apiCountry = apiTravelCountries?.find(tc => 
                    tc.country_name.toLowerCase() === country.name.toLowerCase() ||
                    tc.country_name === country.code
                );
                if (apiCountry?.id) {
                    await deleteTravelCountry(apiCountry.id);
                }
            }

            // Add new countries
            for (const country of countriesToAdd) {
                await addTravelCountry(country.name);
            }

            // Refresh the data
            await fetchTravelCountries();
            
            setVisaCountries(nextCountries);
            toast.success("Travel availability updated successfully!");
            setIsDialogOpen(false);
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to update travel availability');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setTempCountries(visaCountries);
        setMarkAll(haveSameCountries(visaCountries, countries));
        setSearchQuery("");
        setIsDialogOpen(false);
    };

    const filteredCountries = useMemo(() => {
        if (!searchQuery.trim()) {
            return countries.slice(0, 6);
        }
        const query = searchQuery.trim().toLowerCase();
        return countries
            .filter((country) => country.name.toLowerCase().includes(query))
            .slice(0, 6);
    }, [searchQuery]);

    const pills = markAll ? countries.slice(0, 6) : tempCountries;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <div
                        onClick={handleOpenDialog}
                        className="flex flex-row gap-5 h-[44px] w-auto text-base font-medium rounded-[15px]  bg-transparent border px-9 justify-center items-center cursor-pointer hover:bg-muted/50 border-[#444444] "
                    >
                        Available to travel
                    </div>
                </DialogTrigger>
                <DialogContent className="w-full max-w-[430px]  border-none bg-transparent p-0">
                    <div className="mx-auto flex overflow-x-auto h-[500px] w-full max-w-[393px] flex-col rounded-t-[20px] bg-white px-5 pb-6 pt-[25px] shadow-[0_8px_18px_rgba(0,0,0,0.1)]">
                        <div className="mx-auto mb-6 h-[5px] w-[150px] rounded-full bg-[#868686]" />
                        <div className="flex flex-col gap-[25px]">
                            <div className="space-y-2">
                                <h2 className="text-[22px] font-normal leading-[33px] text-black">Available to travel</h2>
                                <p className="text-xs leading-[18px] text-[#181818]">
                                    Status to show your are available to travel around for work.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="relative">
                                    <Input
                                        value={markAll ? "All countries" : searchQuery}
                                        onChange={(e) => {
                                            setMarkAll(false);
                                            setSearchQuery(e.target.value);
                                        }}
                                        placeholder="Type for any country"
                                        className="h-[44px] rounded-[20px] border border-[#31A7AC] px-5 pr-14 text-sm text-[#181818] focus-visible:border-[#31A7AC] focus-visible:ring-[#31A7AC]/15"
                                        disabled={markAll}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAddCountryFromSearch}
                                        variant="ghost"
                                        disabled={markAll}
                                        className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-[#31A7AC] hover:bg-transparent"
                                    >
                                        <Plus className="size-5" />
                                    </Button>
                                    {!markAll && searchQuery && (
                                        <div className="absolute left-0 right-0 top-[110%] z-10 rounded-[12px] border border-[#31A7AC]/40 bg-white shadow-lg">
                                            {filteredCountries.length ? (
                                                filteredCountries.map((country) => (
                                                    <button
                                                        key={country.code}
                                                        type="button"
                                                        onClick={() => handleSelectCountry(country)}
                                                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-[#F5FFFF]"
                                                    >
                                                        <span className="text-lg">{country.flag}</span>
                                                        <span className="flex-1">{country.name}</span>
                                                        <span className="text-xs text-muted-foreground">{country.code}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="px-4 py-2 text-xs text-muted-foreground">No country found.</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {pills.length === 0 && !markAll && (
                                        <p className="text-sm text-muted-foreground">No countries selected yet.</p>
                                    )}
                                    {pills.map((country) => (
                                        <div
                                            key={country.code}
                                            className="flex items-center gap-3 rounded-[15px] border border-[#31A7AC] px-4 py-2"
                                        >
                                            <span className="text-lg">{country.flag}</span>
                                            <span className="text-sm text-black">{country.name}</span>
                                            {!markAll && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCountry(country.code)}
                                                    className="text-[#31A7AC]"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <label className="flex items-center gap-4 text-base text-[#2E2E2E]">
                                    <Checkbox
                                        checked={markAll}
                                        onCheckedChange={(checked) => handleMarkAllToggle(Boolean(checked))}
                                        className="size-6 rounded-md border border-black data-[state=checked]:border-[#31A7AC] data-[state=checked]:bg-[#31A7AC]"
                                    />
                                    Mark as all countries
                                </label>
                            </div>
                        </div>

                        <div className="mt-auto flex w-full gap-3 pt-6">
                            <Button
                                type="button"
                                onClick={handleCancel}
                                variant="outline"
                                className="h-11 flex-1 rounded-[16px] border border-[#31A7AC] text-base font-medium text-[#31A7AC]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="h-11 flex-1 rounded-[16px] bg-[#31A7AC] text-base font-medium text-white hover:bg-[#2b9497]"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
