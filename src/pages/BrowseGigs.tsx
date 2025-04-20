
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import GigCard from "@/components/GigCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";

// Demo data for gigs
const allGigs = [
  {
    id: "1",
    title: "Need a YouTube Thumbnail for my Study Vlog",
    description: "I want a clean, modern thumbnail with bold fonts. Use my picture. Text should be: 'How I Study for Exams'.",
    budget: 150,
    deadline: "2025-05-01",
    category: "Design"
  },
  {
    id: "2",
    title: "Help with Python Script for Data Analysis",
    description: "I need a simple script to analyze CSV data for my statistics project. Must have visualizations.",
    budget: 200,
    deadline: "2025-04-25",
    category: "Code"
  },
  {
    id: "3",
    title: "Proofread my English Essay (5 pages)",
    description: "Looking for someone to check grammar, punctuation and improve the flow of my essay on climate change.",
    budget: 100,
    deadline: "2025-04-23",
    category: "Docs"
  },
  {
    id: "4",
    title: "Logo Design for Student Club",
    description: "Need a simple but professional logo for our new tech club at university. Should include the name 'TechMinds'.",
    budget: 180,
    deadline: "2025-04-29",
    category: "Design"
  },
  {
    id: "5",
    title: "React Component Bug Fix",
    description: "Having issues with a form submission in my React app. Need someone to debug and fix it.",
    budget: 250,
    deadline: "2025-04-26",
    category: "Code"
  },
  {
    id: "6",
    title: "PowerPoint for Class Presentation",
    description: "Need a professional-looking PowerPoint with 15 slides about renewable energy sources.",
    budget: 120,
    deadline: "2025-04-22",
    category: "Docs"
  },
];

const BrowseGigs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState([50, 500]);
  const [sortBy, setSortBy] = useState("newest");
  
  // Filter gigs based on search criteria
  const filteredGigs = allGigs.filter((gig) => {
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          gig.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "" || gig.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesBudget = gig.budget >= priceRange[0] && gig.budget <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesBudget;
  });
  
  // Sort gigs
  const sortedGigs = [...filteredGigs].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    } else if (sortBy === "highest") {
      return b.budget - a.budget;
    } else if (sortBy === "lowest") {
      return a.budget - b.budget;
    }
    return 0;
  });
  
  const updateCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      searchParams.set("category", category);
    } else {
      searchParams.delete("category");
    }
    setSearchParams(searchParams);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 sticky top-24">
            <div className="bg-background border border-border rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">Filters</h2>
              
              <Accordion type="single" collapsible defaultValue="category">
                <AccordionItem value="category">
                  <AccordionTrigger>Category</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <Button 
                        variant={selectedCategory === "" ? "default" : "outline"} 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => updateCategoryFilter("")}
                      >
                        All Categories
                      </Button>
                      <Button 
                        variant={selectedCategory === "design" ? "default" : "outline"} 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => updateCategoryFilter("design")}
                      >
                        Design
                      </Button>
                      <Button 
                        variant={selectedCategory === "code" ? "default" : "outline"} 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => updateCategoryFilter("code")}
                      >
                        Code
                      </Button>
                      <Button 
                        variant={selectedCategory === "docs" ? "default" : "outline"} 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => updateCategoryFilter("docs")}
                      >
                        Docs
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="budget">
                  <AccordionTrigger>Budget Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <Slider 
                        defaultValue={[50, 500]} 
                        min={50} 
                        max={500} 
                        step={10}
                        value={priceRange}
                        onValueChange={setPriceRange}
                      />
                      <div className="flex items-center justify-between">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold">Browse Gigs</h1>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Input
                  placeholder="Search gigs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Budget</SelectItem>
                    <SelectItem value="lowest">Lowest Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Results count */}
            <p className="text-muted-foreground mb-6">
              {sortedGigs.length} {sortedGigs.length === 1 ? 'gig' : 'gigs'} found
            </p>
            
            {/* Gigs Grid */}
            {sortedGigs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedGigs.map((gig) => (
                  <GigCard key={gig.id} {...gig} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No gigs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BrowseGigs;
