
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
import { format, differenceInDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Gig = Database['public']['Tables']['gigs']['Row'] & {
  profiles: {
    name: string;
    email: string;
  } | null;
};

type Application = Database['public']['Tables']['applications']['Row'];

const GigDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [gig, setGig] = useState<Gig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationText, setApplicationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  
  // Fetch the gig and check if the user has already applied
  useEffect(() => {
    const fetchGig = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("gigs")
          .select(`
            *,
            profiles:created_by (name, email)
          `)
          .eq("id", id)
          .single();
          
        if (error) throw error;
        if (data) setGig(data as Gig);
        
        // Check if user has already applied
        if (user) {
          const { data: applicationData, error: applicationError } = await supabase
            .from("applications")
            .select("id")
            .eq("gig_id", id)
            .eq("freelancer_id", user.id)
            .single();
            
          if (!applicationError && applicationData) {
            setHasApplied(true);
          }
        }
      } catch (error: any) {
        console.error("Error fetching gig:", error);
        toast.error("Failed to load gig details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGig();
  }, [id, user]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading gig details...</p>
        </div>
      </Layout>
    );
  }
  
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
    if (!user || !profile) {
      toast.error("You must be logged in to apply");
      navigate("/login");
      return;
    }
    
    if (profile.role !== "freelancer") {
      toast.error("Only freelancers can apply to gigs");
      return;
    }
    
    if (!applicationText.trim()) {
      toast.error("Please write a message to the client");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          gig_id: gig.id,
          freelancer_id: user.id,
          message: applicationText,
          status: "pending"
        });
        
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success("Your application has been sent!");
      setHasApplied(true);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const deadlineDate = new Date(gig.deadline);
  const today = new Date();
  const daysRemaining = differenceInDays(deadlineDate, today);
  const isOwner = user?.id === gig.created_by;
  const canApply = !isOwner && profile?.role === "freelancer" && !hasApplied;
  
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
              
              {canApply && (
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
              )}
              
              {hasApplied && (
                <div className="bg-primary/10 text-primary p-4 rounded-md mb-4 text-center">
                  <p className="font-semibold">You've already applied to this gig!</p>
                  <p className="text-sm mt-1">The client will review your application soon.</p>
                </div>
              )}
              
              {isOwner && (
                <div className="bg-secondary/20 p-4 rounded-md mb-4 text-center">
                  <p className="font-semibold">This is your gig</p>
                  <p className="text-sm mt-1">You can manage it from your dashboard.</p>
                  <Button 
                    variant="outline" 
                    className="mt-3 w-full"
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
              
              <div className="border-t border-border pt-4">
                <h3 className="font-medium mb-3">About the Client</h3>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold mr-3">
                    {gig.profiles?.name?.[0].toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium">{gig.profiles?.name || 'Anonymous'}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Member since {format(new Date(gig.created_at), "MMMM yyyy")}
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
