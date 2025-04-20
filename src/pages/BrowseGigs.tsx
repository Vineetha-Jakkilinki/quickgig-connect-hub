
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import GigCard from "@/components/GigCard";

type Gig = Database['public']['Tables']['gigs']['Row'];
type GigCategory = Database['public']['Enums']['gig_category'];

const BrowseGigs = () => {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "all" as string | GigCategory,
    search: "",
    budget: [50, 500] as [number, number],
  });

  const fetchGigs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("gigs")
        .select(`
          *,
          profiles:created_by (name)
        `)
        .eq("status", "open")
        .gte("budget", filters.budget[0])
        .lte("budget", filters.budget[1]);

      if (filters.category !== "all") {
        query = query.eq("category", filters.category as GigCategory);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGigs(data as any);
    } catch (error: any) {
      console.error("Error fetching gigs:", error);
      toast.error("Failed to load gigs. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [filters.category, filters.budget]);

  const handleSearch = () => {
    fetchGigs();
  };

  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, category: value }));
  };

  const handleBudgetChange = (value: [number, number]) => {
    setFilters(prev => ({ ...prev, budget: value }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Browse Gigs</h1>
        <p className="text-muted-foreground mb-8">
          Find opportunities that match your skills and interests
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-background border border-border rounded-lg p-4 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={filters.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Code">Code</SelectItem>
                      <SelectItem value="Docs">Docs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Budget Range: ₹{filters.budget[0]} - ₹{filters.budget[1]}
                  </label>
                  <Slider
                    min={50}
                    max={500}
                    step={10}
                    value={[filters.budget[0], filters.budget[1]]}
                    onValueChange={(value) => handleBudgetChange(value as [number, number])}
                    className="mt-2"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setFilters({
                    category: "all",
                    search: "",
                    budget: [50, 500],
                  })}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Search gigs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="flex-1"
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
            
            {loading ? (
              <div className="text-center py-20">
                <p>Loading gigs...</p>
              </div>
            ) : gigs.length === 0 ? (
              <div className="text-center py-20 border border-border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">No gigs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or check back later for new opportunities
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {gigs.map((gig) => (
                  <div 
                    key={gig.id}
                    className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/gig/${gig.id}`)}
                  >
                    <GigCard 
                      id={gig.id} 
                      title={gig.title} 
                      description={gig.description} 
                      budget={gig.budget} 
                      deadline={gig.deadline} 
                      category={gig.category} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BrowseGigs;
