
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CategoryBadge from "@/components/ui/CategoryBadge";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { format } from "date-fns";

// Mock gig data
const gigs = [
  {
    id: "1",
    title: "Need a YouTube Thumbnail for my Study Vlog",
    description: "I want a clean, modern thumbnail with bold fonts. Use my picture. Text should be: 'How I Study for Exams'. The thumbnail should be visually appealing and stand out in YouTube search results. I'm looking for something that uses good typography and subtle effects. I can provide my photo, but you should be able to choose a good crop and edit it appropriately for maximum impact.",
    budget: 150,
    deadline: "2025-05-01",
    category: "Design",
    client: {
      name: "Riya S.",
      rating: 4.8,
      gigsPosts: 5,
      joinedDate: "2024-12-15"
    }
  },
  {
    id: "2",
    title: "Help with Python Script for Data Analysis",
    description: "I need a simple script to analyze CSV data for my statistics project. Must have visualizations. The script should be able to calculate basic statistics like mean, median, standard deviation, etc. Should also generate at least 3 different types of visualizations (scatter plot, histogram, box plot). Documentation is important so I can understand how to use it. Code should be clean and well-commented.",
    budget: 200,
    deadline: "2025-04-25",
    category: "Code",
    client: {
      name: "Aditya K.",
      rating: 4.5,
      gigsPosts: 3,
      joinedDate: "2025-01-05"
    }
  },
  {
    id: "3",
    title: "Proofread my English Essay (5 pages)",
    description: "Looking for someone to check grammar, punctuation and improve the flow of my essay on climate change. The essay is approximately 1,500 words and needs to be checked for grammatical errors, sentence structure, and overall coherence. I'd also appreciate feedback on the strength of my arguments and suggestions for improvement. This is for my Environmental Studies class.",
    budget: 100,
    deadline: "2025-04-23",
    category: "Docs",
    client: {
      name: "Neha P.",
      rating: 4.9,
      gigsPosts: 8,
      joinedDate: "2024-10-20"
    }
  },
];

const GigDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [applicationText, setApplicationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Find the gig with the matching ID
  const gig = gigs.find((g) => g.id === id);
  
  if (!gig) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Gig Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The gig you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/browse">
            <Button>Browse Gigs</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  const handleApply = async () => {
    if (!applicationText.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const deadlineDate = new Date(gig.deadline);
  const today = new Date();
  const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <Link to="/browse" className="text-muted-foreground hover:text-foreground">
                Browse Gigs
              </Link>
              <span className="text-muted-foreground">›</span>
              <Link 
                to={`/browse?category=${gig.category.toLowerCase()}`} 
                className="text-muted-foreground hover:text-foreground"
              >
                {gig.category}
              </Link>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <CategoryBadge category={gig.category} />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {daysRemaining <= 0 ? 'Due today' : daysRemaining === 1 ? '1 day left' : `${daysRemaining} days left`}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                ₹{gig.budget}
              </span>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <div className="bg-muted/30 p-4 rounded-lg text-foreground/90 whitespace-pre-line">
                {gig.description}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Requirements</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Must be completed by {format(new Date(gig.deadline), "PPP")} ({daysRemaining} days)</li>
                <li>Budget: ₹{gig.budget}</li>
                <li>Clear communication throughout the process</li>
                <li>Must be willing to make revisions if needed</li>
              </ul>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <div className="bg-background border border-border rounded-lg p-6 sticky top-24">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">₹{gig.budget}</h2>
                <p className="text-muted-foreground">
                  Due {format(new Date(gig.deadline), "PPP")}
                </p>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mb-4">Apply for this Gig</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply for Gig</DialogTitle>
                    <DialogDescription>
                      Tell the client why you're a good fit for this gig.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {isSuccess ? (
                    <div className="text-center py-4">
                      <div className="mb-4 text-green-500 text-6xl">✓</div>
                      <h3 className="text-xl font-medium mb-2">Application Sent!</h3>
                      <p className="text-muted-foreground mb-4">
                        The client will review your application and get in touch if interested.
                      </p>
                      <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                      </DialogClose>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        placeholder="Introduce yourself and explain why you're the right person for this gig..."
                        className="min-h-[150px] mb-4"
                        value={applicationText}
                        onChange={(e) => setApplicationText(e.target.value)}
                      />
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          onClick={handleApply} 
                          disabled={isSubmitting || !applicationText.trim()}
                        >
                          {isSubmitting ? "Sending..." : "Send Application"}
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
              
              <div className="border-t border-border pt-4">
                <h3 className="font-medium mb-3">About the Client</h3>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold mr-3">
                    {gig.client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{gig.client.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="flex items-center">
                        ⭐ {gig.client.rating}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{gig.client.gigsPosts} gigs</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Member since {format(new Date(gig.client.joinedDate), "MMMM yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GigDetails;
