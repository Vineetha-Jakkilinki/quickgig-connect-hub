
import { useState } from "react";
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
import { format } from "date-fns";

// Fake user data
const userData = {
  name: "Riya S.",
  email: "riya@example.com",
  joined: "2024-12-15",
  role: "client", // or "freelancer"
};

// Fake client gigs data
const postedGigs = [
  {
    id: "1",
    title: "Need a YouTube Thumbnail for my Study Vlog",
    description: "I want a clean, modern thumbnail with bold fonts.",
    budget: 150,
    deadline: "2025-05-01",
    category: "Design",
    status: "Open",
    applicants: 3,
  },
  {
    id: "2",
    title: "Help with Python Script",
    description: "Need help with a data analysis script.",
    budget: 200,
    deadline: "2025-04-24",
    category: "Code",
    status: "In Progress",
    applicants: 5,
    freelancer: {
      name: "Arjun K.",
      rating: 4.9,
    },
  },
];

// Fake freelancer gigs data
const appliedGigs = [
  {
    id: "3",
    title: "Logo for Student Club",
    description: "Design a logo for our tech club.",
    budget: 180,
    deadline: "2025-04-29",
    category: "Design",
    status: "Applied",
    client: {
      name: "Aditya K.",
    },
    appliedDate: "2025-04-15",
  },
  {
    id: "4",
    title: "Proofread Research Paper",
    description: "Need someone to check my 10-page paper.",
    budget: 120,
    deadline: "2025-04-22",
    category: "Docs",
    status: "In Progress",
    client: {
      name: "Neha P.",
    },
    appliedDate: "2025-04-14",
  },
  {
    id: "5",
    title: "Design Social Media Posts",
    description: "Create 5 Instagram posts for my small business.",
    budget: 250,
    deadline: "2025-04-25",
    category: "Design",
    status: "Completed",
    client: {
      name: "Vikram S.",
    },
    appliedDate: "2025-04-10",
    completedDate: "2025-04-17",
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("posted");
  
  // In a real app, this would be determined by the user's authentication state
  const userRole = userData.role;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          
          {userRole === "client" ? (
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
                {userRole === "client" ? postedGigs.length : appliedGigs.length}
              </div>
              <p className="text-muted-foreground">
                Total {userRole === "client" ? "Posted" : "Applied"} Gigs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold mb-1">
                {userRole === "client" 
                  ? postedGigs.filter(g => g.status === "In Progress").length
                  : appliedGigs.filter(g => g.status === "In Progress").length
                }
              </div>
              <p className="text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold mb-1">
                {userRole === "client" 
                  ? postedGigs.filter(g => g.status === "Open").length
                  : appliedGigs.filter(g => g.status === "Applied").length
                }
              </div>
              <p className="text-muted-foreground">
                {userRole === "client" ? "Open Gigs" : "Pending Applications"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold mb-1">
                {userRole === "client" 
                  ? 8 // Fake total applicants
                  : appliedGigs.filter(g => g.status === "Completed").length
                }
              </div>
              <p className="text-muted-foreground">
                {userRole === "client" ? "Total Applicants" : "Completed Gigs"}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Client View */}
        {userRole === "client" && (
          <Tabs defaultValue="posted" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="posted">My Posted Gigs</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posted">
              <div className="grid grid-cols-1 gap-4">
                {postedGigs.map((gig) => (
                  <div 
                    key={gig.id} 
                    className="border border-border rounded-lg p-4 bg-background"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryBadge category={gig.category} />
                          <Badge 
                            variant={gig.status === "Open" ? "outline" : "secondary"}
                          >
                            {gig.status}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          <Link to={`/gig/${gig.id}`} className="hover:text-primary transition-colors">
                            {gig.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {gig.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>₹{gig.budget}</span>
                          <span>Due: {format(new Date(gig.deadline), "MMM d, yyyy")}</span>
                          <span>{gig.applicants} Applicants</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link to={`/gig/${gig.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                    
                    {gig.status === "In Progress" && gig.freelancer && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm font-medium">
                          Currently being worked on by: {gig.freelancer.name} (⭐ {gig.freelancer.rating})
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="applications">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No applications to show. Check back soon!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Freelancer View */}
        {userRole === "freelancer" && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Gigs</TabsTrigger>
              <TabsTrigger value="applied">Applied</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 gap-4">
                {appliedGigs.map((gig) => (
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
                              gig.status === "Completed" 
                                ? "default" 
                                : gig.status === "In Progress" 
                                  ? "secondary" 
                                  : "outline"
                            }
                          >
                            {gig.status}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          <Link to={`/gig/${gig.id}`} className="hover:text-primary transition-colors">
                            {gig.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {gig.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>₹{gig.budget}</span>
                          <span>Due: {format(new Date(gig.deadline), "MMM d, yyyy")}</span>
                          <span>Client: {gig.client.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link to={`/gig/${gig.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                        {gig.status === "In Progress" && (
                          <Button size="sm">Mark Complete</Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border text-sm">
                      <div className="flex items-center gap-4">
                        <span>
                          Applied: {format(new Date(gig.appliedDate), "MMM d, yyyy")}
                        </span>
                        {gig.status === "Completed" && gig.completedDate && (
                          <span>
                            Completed: {format(new Date(gig.completedDate), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="applied">
              <div className="grid grid-cols-1 gap-4">
                {appliedGigs
                  .filter(gig => gig.status === "Applied")
                  .map((gig) => (
                    <div 
                      key={gig.id} 
                      className="border border-border rounded-lg p-4 bg-background"
                    >
                      {/* Same content as above, filtered */}
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CategoryBadge category={gig.category} />
                            <Badge variant="outline">{gig.status}</Badge>
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            <Link to={`/gig/${gig.id}`} className="hover:text-primary transition-colors">
                              {gig.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {gig.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>₹{gig.budget}</span>
                            <span>Due: {format(new Date(gig.deadline), "MMM d, yyyy")}</span>
                            <span>Client: {gig.client.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/gig/${gig.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border text-sm">
                        <div className="flex items-center gap-4">
                          <span>
                            Applied: {format(new Date(gig.appliedDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="in-progress">
              {/* Similar to "applied" tab, but filtered for "In Progress" */}
              <div className="grid grid-cols-1 gap-4">
                {appliedGigs
                  .filter(gig => gig.status === "In Progress")
                  .map((gig) => (
                    <div 
                      key={gig.id} 
                      className="border border-border rounded-lg p-4 bg-background"
                    >
                      {/* Same content structure */}
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CategoryBadge category={gig.category} />
                            <Badge variant="secondary">{gig.status}</Badge>
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            <Link to={`/gig/${gig.id}`} className="hover:text-primary transition-colors">
                              {gig.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {gig.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>₹{gig.budget}</span>
                            <span>Due: {format(new Date(gig.deadline), "MMM d, yyyy")}</span>
                            <span>Client: {gig.client.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/gig/${gig.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                          <Button size="sm">Mark Complete</Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border text-sm">
                        <div className="flex items-center gap-4">
                          <span>
                            Applied: {format(new Date(gig.appliedDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              {/* Similar to "applied" tab, but filtered for "Completed" */}
              <div className="grid grid-cols-1 gap-4">
                {appliedGigs
                  .filter(gig => gig.status === "Completed")
                  .map((gig) => (
                    <div 
                      key={gig.id} 
                      className="border border-border rounded-lg p-4 bg-background"
                    >
                      {/* Same content structure */}
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CategoryBadge category={gig.category} />
                            <Badge>{gig.status}</Badge>
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            <Link to={`/gig/${gig.id}`} className="hover:text-primary transition-colors">
                              {gig.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {gig.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>₹{gig.budget}</span>
                            <span>Client: {gig.client.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/gig/${gig.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border text-sm">
                        <div className="flex items-center gap-4">
                          <span>
                            Applied: {format(new Date(gig.appliedDate), "MMM d, yyyy")}
                          </span>
                          {gig.completedDate && (
                            <span>
                              Completed: {format(new Date(gig.completedDate), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
