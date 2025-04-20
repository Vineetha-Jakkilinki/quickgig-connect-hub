
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CategoryBadge from "@/components/ui/CategoryBadge";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format, isAfter } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Gig = Database['public']['Tables']['gigs']['Row'];
type Application = Database['public']['Tables']['applications']['Row'] & {
  profiles: {
    name: string;
  } | null;
  gigs: Gig | null;
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("posted");
  const [clientGigs, setClientGigs] = useState<Gig[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [gigApplications, setGigApplications] = useState<Record<string, Application[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchClientGigs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("gigs")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setClientGigs(data || []);
      
      // Fetch applications for each gig
      const gigsApplicationsObj: Record<string, Application[]> = {};
      for (const gig of data || []) {
        const { data: appData, error: appError } = await supabase
          .from("applications")
          .select(`
            *,
            profiles:freelancer_id (name)
          `)
          .eq("gig_id", gig.id);
          
        if (appError) throw appError;
        gigsApplicationsObj[gig.id] = appData as Application[];
      }
      
      setGigApplications(gigsApplicationsObj);
    } catch (error: any) {
      console.error("Error fetching client gigs:", error);
      toast.error("Failed to load your gigs");
    }
  };
  
  const fetchFreelancerApplications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          profiles:freelancer_id (name),
          gigs:gig_id (*)
        `)
        .eq("freelancer_id", user.id)
        .order("applied_at", { ascending: false });
        
      if (error) throw error;
      setApplications(data as Application[]);
    } catch (error: any) {
      console.error("Error fetching freelancer applications:", error);
      toast.error("Failed to load your applications");
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (profile?.role === "client") {
        await fetchClientGigs();
      } else {
        await fetchFreelancerApplications();
      }
      setLoading(false);
    };
    
    if (user && profile) {
      fetchData();
    }
  }, [user, profile]);
  
  const updateApplicationStatus = async (applicationId: string, status: "accepted" | "rejected", gigId: string) => {
    try {
      // Update application status
      const { error: appError } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", applicationId);
        
      if (appError) throw appError;
      
      // If accepting, update gig status to in_progress
      if (status === "accepted") {
        const { error: gigError } = await supabase
          .from("gigs")
          .update({ status: "in_progress" })
          .eq("id", gigId);
          
        if (gigError) throw gigError;
      }
      
      // Refresh data
      if (profile?.role === "client") {
        await fetchClientGigs();
      }
      
      toast.success(`Application ${status === "accepted" ? "accepted" : "rejected"} successfully`);
    } catch (error: any) {
      console.error("Error updating application:", error);
      toast.error(`Failed to ${status} application`);
    }
  };
  
  const markGigComplete = async (gigId: string) => {
    try {
      const { error } = await supabase
        .from("gigs")
        .update({ status: "completed" })
        .eq("id", gigId);
        
      if (error) throw error;
      
      // Refresh data
      if (profile?.role === "client") {
        await fetchClientGigs();
      } else {
        await fetchFreelancerApplications();
      }
      
      toast.success("Gig marked as completed!");
    } catch (error: any) {
      console.error("Error completing gig:", error);
      toast.error("Failed to mark gig as completed");
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }
  
  // Calculate stats
  const totalGigs = profile?.role === "client" ? clientGigs.length : applications.length;
  const inProgressGigs = profile?.role === "client" 
    ? clientGigs.filter(g => g.status === "in_progress").length
    : applications.filter(a => a.gigs?.status === "in_progress").length;
  const openGigs = profile?.role === "client" 
    ? clientGigs.filter(g => g.status === "open").length
    : applications.filter(a => a.status === "pending").length;
  const totalApplicants = Object.values(gigApplications).reduce((sum, apps) => sum + apps.length, 0);
  const completedGigs = profile?.role === "client"
    ? clientGigs.filter(g => g.status === "completed").length
    : applications.filter(a => a.gigs?.status === "completed").length;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          
          {profile?.role === "client" ? (
            <Link to="/post">
              <Button>Post a New Gig</Button>
            </Link>
          ) : (
            <Link to="/browse">
              <Button>Find More Gigs</Button>
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold mb-1">
                {totalGigs}
              </div>
              <p className="text-muted-foreground">
                Total {profile?.role === "client" ? "Posted" : "Applied"} Gigs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold mb-1">
                {inProgressGigs}
              </div>
              <p className="text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold mb-1">
                {openGigs}
              </div>
              <p className="text-muted-foreground">
                {profile?.role === "client" ? "Open Gigs" : "Pending Applications"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold mb-1">
                {profile?.role === "client" ? totalApplicants : completedGigs}
              </div>
              <p className="text-muted-foreground">
                {profile?.role === "client" ? "Total Applicants" : "Completed Gigs"}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Client View */}
        {profile?.role === "client" && (
          <Tabs defaultValue="posted" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="posted">My Posted Gigs</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posted">
              {clientGigs.length === 0 ? (
                <div className="text-center py-20 border border-border rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">You haven't posted any gigs yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Post your first gig to start finding freelancers
                  </p>
                  <Link to="/post">
                    <Button>Post a Gig</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {clientGigs.map((gig) => (
                    <div 
                      key={gig.id} 
                      className="border border-border rounded-lg p-4 bg-background"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CategoryBadge category={gig.category} />
                            <Badge 
                              variant={
                                gig.status === "open" 
                                  ? "outline" 
                                  : gig.status === "in_progress"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {gig.status === "open" 
                                ? "Open" 
                                : gig.status === "in_progress" 
                                  ? "In Progress" 
                                  : "Completed"}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            <Link to={`/gig/${gig.id}`} className="hover:text-primary transition-colors">
                              {gig.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {gig.description.length > 100 
                              ? `${gig.description.substring(0, 100)}...` 
                              : gig.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>₹{gig.budget}</span>
                            <span>Due: {format(new Date(gig.deadline), "MMM d, yyyy")}</span>
                            <span>{gigApplications[gig.id]?.length || 0} Applicants</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/gig/${gig.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                          {gig.status === "in_progress" && (
                            <Button 
                              size="sm"
                              onClick={() => markGigComplete(gig.id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {gigApplications[gig.id]?.length > 0 && gig.status === "open" && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <h4 className="font-medium mb-3">Applications ({gigApplications[gig.id]?.length})</h4>
                          <div className="space-y-3">
                            {gigApplications[gig.id]?.map((app) => (
                              <div key={app.id} className="bg-muted/30 p-3 rounded-md">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                                      {app.profiles?.name?.[0].toUpperCase() || '?'}
                                    </div>
                                    <span className="font-medium">{app.profiles?.name}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    Applied {format(new Date(app.applied_at), "MMM d, yyyy")}
                                  </span>
                                </div>
                                <p className="text-sm mb-3">{app.message}</p>
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateApplicationStatus(app.id, "rejected", gig.id)}
                                  >
                                    Decline
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => updateApplicationStatus(app.id, "accepted", gig.id)}
                                  >
                                    Accept
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {gig.status === "in_progress" && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <h4 className="font-medium mb-2">Freelancer</h4>
                          {gigApplications[gig.id]?.filter(app => app.status === "accepted").map((app) => (
                            <div key={app.id} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                                {app.profiles?.name?.[0].toUpperCase() || '?'}
                              </div>
                              <span>{app.profiles?.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="applications">
              {Object.keys(gigApplications).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No applications to show. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(gigApplications).map(([gigId, apps]) => {
                    const gig = clientGigs.find(g => g.id === gigId);
                    if (!gig || apps.length === 0) return null;
                    
                    return (
                      <div key={gigId} className="border border-border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-3">
                          <Link to={`/gig/${gigId}`} className="hover:text-primary">
                            {gig.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {apps.length} application{apps.length > 1 ? 's' : ''}
                        </p>
                        <div className="space-y-3">
                          {apps.map(app => (
                            <div key={app.id} className="bg-muted/30 p-3 rounded-md">
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">{app.profiles?.name}</span>
                                <Badge variant={
                                  app.status === "pending" 
                                    ? "outline" 
                                    : app.status === "accepted" 
                                      ? "default" 
                                      : "secondary"
                                }>
                                  {app.status}
                                </Badge>
                              </div>
                              <p className="text-sm">{app.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Freelancer View */}
        {profile?.role === "freelancer" && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Gigs</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {applications.length === 0 ? (
                <div className="text-center py-20 border border-border rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">You haven't applied to any gigs yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse available gigs and start applying
                  </p>
                  <Link to="/browse">
                    <Button>Browse Gigs</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {applications.map((app) => (
                    <div 
                      key={app.id} 
                      className="border border-border rounded-lg p-4 bg-background"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {app.gigs?.category && <CategoryBadge category={app.gigs.category} />}
                            <Badge 
                              variant={
                                app.status === "pending" 
                                  ? "outline" 
                                  : app.status === "accepted" 
                                    ? "default" 
                                    : "secondary"
                              }
                            >
                              {app.status === "pending" 
                                ? "Pending" 
                                : app.status === "accepted" 
                                  ? "Accepted" 
                                  : "Rejected"}
                            </Badge>
                            {app.status === "accepted" && app.gigs?.status && (
                              <Badge 
                                variant={app.gigs.status === "in_progress" ? "secondary" : "default"}
                              >
                                {app.gigs.status === "in_progress" ? "In Progress" : "Completed"}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            <Link to={`/gig/${app.gig_id}`} className="hover:text-primary transition-colors">
                              {app.gigs?.title || "Unknown Gig"}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {app.gigs?.description 
                              ? (app.gigs.description.length > 100 
                                ? `${app.gigs.description.substring(0, 100)}...` 
                                : app.gigs.description)
                              : "No description available"}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            {app.gigs?.budget && <span>₹{app.gigs.budget}</span>}
                            {app.gigs?.deadline && (
                              <span>
                                {isAfter(new Date(app.gigs.deadline), new Date()) 
                                  ? `Due: ${format(new Date(app.gigs.deadline), "MMM d, yyyy")}` 
                                  : "Deadline passed"}
                              </span>
                            )}
                            <span>Applied: {format(new Date(app.applied_at), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/gig/${app.gig_id}`}>
                            <Button variant="outline" size="sm">View Gig</Button>
                          </Link>
                          {app.status === "accepted" && app.gigs?.status === "in_progress" && (
                            <Button 
                              size="sm"
                              onClick={() => markGigComplete(app.gig_id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending">
              <div className="grid grid-cols-1 gap-4">
                {applications
                  .filter(app => app.status === "pending")
                  .map((app) => (
                    <div 
                      key={app.id} 
                      className="border border-border rounded-lg p-4 bg-background"
                    >
                      {/* Same structure as "all" tab but filtered */}
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {app.gigs?.category && <CategoryBadge category={app.gigs.category} />}
                            <Badge variant="outline">Pending</Badge>
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            <Link to={`/gig/${app.gig_id}`} className="hover:text-primary transition-colors">
                              {app.gigs?.title || "Unknown Gig"}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {app.gigs?.description 
                              ? (app.gigs.description.length > 100 
                                ? `${app.gigs.description.substring(0, 100)}...` 
                                : app.gigs.description)
                              : "No description available"}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            {app.gigs?.budget && <span>₹{app.gigs.budget}</span>}
                            {app.gigs?.deadline && (
                              <span>
                                {isAfter(new Date(app.gigs.deadline), new Date()) 
                                  ? `Due: ${format(new Date(app.gigs.deadline), "MMM d, yyyy")}` 
                                  : "Deadline passed"}
                              </span>
                            )}
                            <span>Applied: {format(new Date(app.applied_at), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/gig/${app.gig_id}`}>
                            <Button variant="outline" size="sm">View Gig</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                {applications.filter(app => app.status === "pending").length === 0 && (
                  <div className="text-center py-12 border border-border rounded-lg">
                    <p className="text-muted-foreground">No pending applications</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="in-progress">
              <div className="grid grid-cols-1 gap-4">
                {applications
                  .filter(app => app.status === "accepted" && app.gigs?.status === "in_progress")
                  .map((app) => (
                    <div 
                      key={app.id} 
                      className="border border-border rounded-lg p-4 bg-background"
                    >
                      {/* Same structure as "all" tab but filtered */}
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {app.gigs?.category && <CategoryBadge category={app.gigs.category} />}
                            <Badge>Accepted</Badge>
                            <Badge variant="secondary">In Progress</Badge>
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            <Link to={`/gig/${app.gig_id}`} className="hover:text-primary transition-colors">
                              {app.gigs?.title || "Unknown Gig"}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {app.gigs?.description 
                              ? (app.gigs.description.length > 100 
                                ? `${app.gigs.description.substring(0, 100)}...` 
                                : app.gigs.description)
                              : "No description available"}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            {app.gigs?.budget && <span>₹{app.gigs.budget}</span>}
                            {app.gigs?.deadline && (
                              <span>
                                {isAfter(new Date(app.gigs.deadline), new Date()) 
                                  ? `Due: ${format(new Date(app.gigs.deadline), "MMM d, yyyy")}` 
                                  : "Deadline passed"}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/gig/${app.gig_id}`}>
                            <Button variant="outline" size="sm">View Gig</Button>
                          </Link>
                          <Button 
                            size="sm"
                            onClick={() => markGigComplete(app.gig_id)}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {applications.filter(app => app.status === "accepted" && app.gigs?.status === "in_progress").length === 0 && (
                  <div className="text-center py-12 border border-border rounded-lg">
                    <p className="text-muted-foreground">No gigs in progress</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="grid grid-cols-1 gap-4">
                {applications
                  .filter(app => app.status === "accepted" && app.gigs?.status === "completed")
                  .map((app) => (
                    <div 
                      key={app.id} 
                      className="border border-border rounded-lg p-4 bg-background"
                    >
                      {/* Same structure as "all" tab but filtered */}
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {app.gigs?.category && <CategoryBadge category={app.gigs.category} />}
                            <Badge>Completed</Badge>
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            <Link to={`/gig/${app.gig_id}`} className="hover:text-primary transition-colors">
                              {app.gigs?.title || "Unknown Gig"}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {app.gigs?.description 
                              ? (app.gigs.description.length > 100 
                                ? `${app.gigs.description.substring(0, 100)}...` 
                                : app.gigs.description)
                              : "No description available"}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            {app.gigs?.budget && <span>₹{app.gigs.budget}</span>}
                            <span>Completed: {format(new Date(app.updated_at), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/gig/${app.gig_id}`}>
                            <Button variant="outline" size="sm">View Gig</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                {applications.filter(app => app.status === "accepted" && app.gigs?.status === "completed").length === 0 && (
                  <div className="text-center py-12 border border-border rounded-lg">
                    <p className="text-muted-foreground">No completed gigs</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
